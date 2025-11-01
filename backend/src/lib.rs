use candid::{CandidType,Decode,Deserialize,Encode};
use ic_cdk::caller;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl,StableBTreeMap,Storable,BoundedStorable};
use std::{cell::RefCell,borrow::Cow};
use sha2::{Digest, Sha256};

type Memory = VirtualMemory<DefaultMemoryImpl>;
static PROOF_LENTGH: u32 = 10;
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static COMPANY_EMPLOYEES: RefCell<StableBTreeMap<StorableString, IDList, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))) // compID -> arr of empID
    );

    static EMPLOYEE_COMPANIES: RefCell<StableBTreeMap<StorableString, IDList, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))) // empID -> arr of compID
    );
    static EMPLOYEE_COMPANIES_ADMIN: RefCell<StableBTreeMap<StorableString, IDList, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))) // empID Admin -> arr of compID  
    );

    static COMPANY_MAP: RefCell<StableBTreeMap<StorableString, Company, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))) // CompID -> comp
    );
    static EMPLOYEE_MAP: RefCell<StableBTreeMap<StorableString, Employee, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))) // EmpID -> emp
    );
    static PROOF_MAP: RefCell<StableBTreeMap<u128, Proof, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))) // ProofID -> Proof
    );
    static NEXT_PROOF_ID: RefCell<u128> = RefCell::new(6);
}

#[derive(CandidType, Deserialize, Clone, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub struct StorableString {
    pub value: String,
}
pub struct IDList {
    pub ids: Vec<String>,
}


impl Storable for IDList {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.ids).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self {
            ids: Decode!(bytes.as_ref(), Vec<String>).unwrap(),
        }
    }
}

impl Storable for Company {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Company).unwrap()
    }
}

impl Storable for Employee {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Employee).unwrap()
    }
}

impl Storable for Proof {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Proof).unwrap()
    }
}

impl Storable for StorableString {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(&self.value).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Self{
            value: Decode!(bytes.as_ref(), String).unwrap(),
        }
    }
}


impl BoundedStorable for IDList {
    const MAX_SIZE: u32 = 1024;
    const IS_FIXED_SIZE: bool = false;
}

impl BoundedStorable for Company {
    const MAX_SIZE: u32 = 512;
    const IS_FIXED_SIZE: bool = false;
}

impl BoundedStorable for Employee {
    const MAX_SIZE: u32 = 512;
    const IS_FIXED_SIZE: bool = false;
}

impl BoundedStorable for Proof {
    const MAX_SIZE: u32 = 512;
    const IS_FIXED_SIZE: bool = false;
}

impl BoundedStorable for StorableString {
    const MAX_SIZE: u32 = 200;
    const IS_FIXED_SIZE: bool = false;
}



#[derive(CandidType, Deserialize, Clone)]
struct Company {
    id: String,
    name: String,
    admin_id: String,
    created_at: u64,
    is_active: bool,
}

#[derive(CandidType, Deserialize, Clone)]
struct Employee {
    id: String,
    full_name: String,
}

#[derive(CandidType, Deserialize, Clone)]
struct Proof {
    code: String,
    company_id: String,
    employee_id: String,
    created_at: u64,
    expires_at: u64,
    is_used: bool,
}

async fn generate_random_code(length: usize) -> String {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789".chars().collect::<Vec<char>>();
    
    let random_bytes = match ic_cdk::api::management_canister::main::raw_rand().await {
        Ok((bytes,)) => bytes,
        Err(_) => {
            ic_cdk::api::time().to_le_bytes().to_vec()
        }
    };
    
    let mut result = String::new();
    for i in 0..length {
        let byte_index = i % random_bytes.len();
        let char_index = (random_bytes[byte_index] as usize) % chars.len();
        result.push(chars[char_index]);
    }
    
    result
}

fn is_company_admin(admin_principal: &String, company_id: &String) -> bool {
    let admin_key = StorableString { value: admin_principal.clone() };

    EMPLOYEE_COMPANIES_ADMIN.with(|comp| {
        let map = comp.borrow();
        if let Some(comp_list) = map.get(&admin_key) {
            return comp_list.ids.contains(company_id);
        }
        false
    })
}

fn is_works_on(user_id: &String, company_id: &String) -> bool {
    let user_key = StorableString { value: user_id.clone() };

    EMPLOYEE_COMPANIES.with(|comp| {
        let map = comp.borrow();
        if let Some(comp_list) = map.get(&user_key) {
            return comp_list.ids.contains(company_id);
        }
        false
    })
}

#[ic_cdk::update]
async fn generate_proof(company_id:String) -> Result<String, &'static str> {
    let caller_principal = ic_cdk::caller();
    let user_id: String = caller_principal.to_text();

    //cheack if user_id works in company_id or not
    if !is_works_on(&user_id,&company_id) {
        return Err("Caller is not works in this company");
    }

    let random_code = generate_random_code(PROOF_LENTGH as usize).await;
    let now = ic_cdk::api::time();

    let proof_id = NEXT_PROOF_ID.with(|next_id| {
        let mut id = next_id.borrow_mut();
        let current_id = *id;
        *id += 1;
        current_id
    });
    let proof_code=format!("{}-{}", random_code,proof_id.to_string()); // clear text-Proof ID

    let mut hasher = Sha256::new();
    hasher.update(proof_code.as_bytes());
    let result = hasher.finalize();
    let hashed_code = hex::encode(result);

    let cur_proof=Proof {
        code: hashed_code,
        company_id: company_id.clone(),
        employee_id: user_id.clone(),
        created_at: now,
        expires_at: now + (24 * 60 * 60 * 1_000_000_000),
        is_used: false,
    };

    PROOF_MAP.with(|p|{
        p.borrow_mut().insert(proof_id, cur_proof.clone());
    });
    Ok(proof_code)
}

#[ic_cdk::query]
fn list_my_companies() -> Vec<String> {
    let caller_principal = ic_cdk::caller();

    let user_id = StorableString {
        value : caller_principal.to_text(),
    };
    
    EMPLOYEE_COMPANIES.with(|map| {
        let map_ref = map.borrow();
        match map_ref.get(&user_id) {
            Some(id_list) => id_list.ids.clone(),
            None => Vec::new(),
        }
    })
}

#[ic_cdk::query]
fn list_my_admin_companies() -> Vec<String> {
    let caller_principal = ic_cdk::caller();

    let user_id = StorableString {
        value : caller_principal.to_text(),
    };
    
    EMPLOYEE_COMPANIES_ADMIN.with(|map| {
        let map_ref = map.borrow();
        match map_ref.get(&user_id) {
            Some(id_list) => id_list.ids.clone(),
            None => Vec::new(),
        }
    })
}


#[ic_cdk::query]
fn list_company_employess(comp_id:String) -> Vec<String> {
    let user_id = StorableString {
        value :comp_id,
    };
    
    COMPANY_EMPLOYEES.with(|map| {
        let map_ref = map.borrow();
        match map_ref.get(&user_id) {
            Some(id_list) => id_list.ids.clone(),
            None => Vec::new(),
        }
    })
}

#[ic_cdk::update]
fn add_employee(comp_id:String,emp_id:String)->bool{
    let caller_principal = ic_cdk::caller();

    if !is_company_admin(&caller_principal.to_text(), &comp_id) {
        ic_cdk::println!("Caller is not admin for this company.");
        return false;
    }

    // Add employee to COMPANY_EMPLOYEES (company -> employees)
    COMPANY_EMPLOYEES.with(|comp|{
        let mut map=comp.borrow_mut();
        let comp_key = StorableString { value: comp_id.clone() };
       
        if let Some(mut emp_list) = map.get(&comp_key) {
            if !emp_list.ids.contains(&emp_id) {
                emp_list.ids.push(emp_id.clone());
                map.insert(comp_key, emp_list);
            }
        } else {
            let new_list = IDList { ids: vec![emp_id.clone()] };
            map.insert(comp_key, new_list);
        }
    });

    // Add company to EMPLOYEE_COMPANIES (employee -> companies)
    EMPLOYEE_COMPANIES.with(|emp|{
        let mut map=emp.borrow_mut();
        let emp_key = StorableString { value: emp_id.clone() };
       
        if let Some(mut comp_list) = map.get(&emp_key) {
            if !comp_list.ids.contains(&comp_id) {
                comp_list.ids.push(comp_id.clone());
                map.insert(emp_key, comp_list);
            }
        } else {
            let new_list = IDList { ids: vec![comp_id.clone()] };
            map.insert(emp_key, new_list);
        }
    });

    true
}

#[ic_cdk::update]
fn remove_employee(comp_id:String,emp_id:String,)->bool{
    let caller_principal = ic_cdk::caller();
    if !is_company_admin(&caller_principal.to_text(), &comp_id) {
        ic_cdk::println!("Caller is not admin for this company.");
        return false;
    }

    // Remove employee from COMPANY_EMPLOYEES (company -> employees)
    let removed_from_company = COMPANY_EMPLOYEES.with(|comp|{
        let mut map=comp.borrow_mut();
        let comp_key = StorableString { value: comp_id.clone() };
       
        if let Some(mut emp_list) = map.get(&comp_key) {
            if let Some(pos) = emp_list.ids.iter().position(|id| id == &emp_id) {
                emp_list.ids.remove(pos);
                map.insert(comp_key, emp_list);
                return true;
            } else {
                // emp not found
                return false;
            }
        } else {
            // comp not found
            return false;
        }
    });

    if !removed_from_company {
        return false;
    }

    // Remove company from EMPLOYEE_COMPANIES (employee -> companies)
    EMPLOYEE_COMPANIES.with(|emp|{
        let mut map=emp.borrow_mut();
        let emp_key = StorableString { value: emp_id.clone() };
       
        if let Some(mut comp_list) = map.get(&emp_key) {
            if let Some(pos) = comp_list.ids.iter().position(|id| id == &comp_id) {
                comp_list.ids.remove(pos);
                map.insert(emp_key, comp_list);
            }
        }
    });

    true
}

#[ic_cdk::update]
fn verify_proof(proof_code: String) -> Result<Proof, &'static str> {

    // get the secound part of proof (ID)
    let proof_id: u128 = proof_code
        .get((PROOF_LENTGH as usize + 1)..)
        .ok_or("Proof code too short")?
        .parse()
        .map_err(|_| "Invalid proof ID")?;

    PROOF_MAP.with(|mp|{
        let mut map=mp.borrow_mut();

        let mut proof = map.get(&proof_id).ok_or("Proof not found")?;

        if proof.is_used {
            return Err("Proof already used");
        }
        if proof.expires_at < ic_cdk::api::time() {
            return Err("Proof expired");                            
        }

        let real_hashed_code=proof.code.clone();

        // get the hash of the proof
        let mut hasher = Sha256::new();
        hasher.update(proof_code.as_bytes());
        let result = hasher.finalize();
        let hashed_code = hex::encode(result);

        // compare the value in the Proof the input value
        if hashed_code != real_hashed_code {    
            return Err("Proof code mismatch");
        }
    
        proof.is_used = true;
        map.insert(proof_id, proof.clone());
        Ok(proof.clone())
    })
}

#[ic_cdk::update]
fn add_new_companey(comp_username:String, comp_name:String)->Result<(), &'static str>{
    
    let storable_comp_username=StorableString{value:comp_username.clone()};
    // check the username
    let exists = COMPANY_MAP.with(|mp| {
        let map = mp.borrow();
        map.contains_key(&storable_comp_username)
    });
    if exists {
        return Err("username is alrady exist");
    }
    

    // add this companey with caller admin
    let admin=caller();
    let admin = admin.to_string();

    // compony data
    let comp=Company{
        id:comp_username.clone(),
        name:comp_name.clone(),
        admin_id:admin.clone(),
        created_at:ic_cdk::api::time(),
        is_active:true, // ToDo : subscribtion using payment mathod 
    };

    // insert company in COMPANY_MAP
    COMPANY_MAP.with(|mp| {
        mp.borrow_mut().insert(storable_comp_username.clone(), comp);
    });

    let storable_admin = StorableString{value:admin};

    
    EMPLOYEE_COMPANIES_ADMIN.with(|map| {
        let mut map = map.borrow_mut();

        if let Some(mut id_list) = map.get(&storable_admin) {
            //admin already if exists -> append new company
            id_list.ids.push(comp_username.clone());
            map.insert(storable_admin, id_list);
        } else {
            // admin not found -> create new entry
            let new_list = IDList {
                ids: vec![comp_username.clone()],
            };
            map.insert(storable_admin, new_list);
        }
    });

    Ok(())

}

ic_cdk::export_candid!();