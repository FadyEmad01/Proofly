use candid::{export_service, Principal};
use candid::{CandidType,Decode,Deserialize,Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl,StableBTreeMap,Storable,BoundedStorable};
use std::string;
use std::{cell::RefCell,borrow::Cow};
use std::collections::HashMap;

type Memory = VirtualMemory<DefaultMemoryImpl>;

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
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))) // empID -> arr of compAdminID 
    );

    static COMPANY_MAP: RefCell<StableBTreeMap<StorableString, Company, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))) // CompID -> comp
    );
    static EMPLOYEE_MAP: RefCell<StableBTreeMap<StorableString, Employee, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))) // EmpID -> emp
    );
    static PROOF_MAP: RefCell<StableBTreeMap<StorableString, Proof, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))) // ProofID -> Proof
    );
    static NEXT_PROOF_ID: RefCell<u64> = RefCell::new(6);
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
    id: u64,
    name: String,
    admin_id: u64,
    created_at: u64,
    is_active: bool,
}

#[derive(CandidType, Deserialize, Clone)]
struct Employee {
    principal: String,
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



#[ic_cdk::update]
async fn generate_proof(company_id:String) -> String {
    let caller_principal = ic_cdk::caller();
    let user_id: String = caller_principal.to_text();

    let random_code = generate_random_code(10).await;
    let now = ic_cdk::api::time();

    let proof_id = NEXT_PROOF_ID.with(|next_id| {
        let mut id = next_id.borrow_mut();
        let current_id = *id;
        *id += 1;
        current_id
    });
    
    let cur_proof=Proof {
        code: format!("{}-{}-{}",company_id, random_code,proof_id.to_string()),
        company_id: company_id.clone(),
        employee_id: user_id.clone(),
        created_at: now,
        expires_at: now + (24 * 60 * 60 * 1_000_000_000),
        is_used: false,
    };

    let proof_key = StorableString { value: proof_id.to_string() };

    PROOF_MAP.with(|p|{
        p.borrow_mut().insert(proof_key, cur_proof.clone());
    });
    cur_proof.code
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
    COMPANY_EMPLOYEES.with(|comp|{
        let mut map=comp.borrow_mut();
        let comp_key = StorableString { value: comp_id.clone() };
       
        if let Some(mut emp_list) = map.get(&comp_key) {
            if !emp_list.ids.contains(&emp_id) {
                emp_list.ids.push(emp_id);
                map.insert(comp_key, emp_list);
            }
        } else {
            let new_list = IDList { ids: vec![emp_id] };
            map.insert(comp_key, new_list);
        }
    });
    true
}

#[ic_cdk::update]
fn remove_employee(comp_id:String,emp_id:String,)->bool{
    COMPANY_EMPLOYEES.with(|comp|{
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
    true
}

#[ic_cdk::query]
fn verify_proof(proof_code: String) -> bool {
    return true;// toDo
}

ic_cdk::export_candid!();