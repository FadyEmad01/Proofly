use candid::{export_service, Principal};
use candid::{CandidType,Decode,Deserialize,Encode};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap,Storable};
use std::{cell::RefCell,borrow::Cow};
use std::collections::HashMap;

/*
type Memory = VirtualMemory<DefaultMemoryImpl>;

const MAX_MEMORY_SIZE:u32=5000;


thread_local! {

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static COMPANY_MAP: RefCell<StableBTreeMap<u64, Company, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
    static COMPANY_ID: RefCell<u64> = RefCell::new(1);

    static EMPLOYEE_MAP: RefCell<StableBTreeMap<String, Employee, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );
    static EMPLOYEE_ID: RefCell<u64> = RefCell::new(3);


    static PROOF_MAP: RefCell<StableBTreeMap<String, Proof, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );
    static PROOF_ID: RefCell<u64> = RefCell::new(3);


}
*/

//####################################################################################

struct Company{
    
    name:String,
    admin_id:String,
    id: String,
    created_at: u64,
    is_active: bool,
    emp:Vec<Employee>,
}

impl Company {
    fn add_employee(&mut self, employee: Employee) {
        self.emp.push(employee);
    }
    
    fn list_my_employee(&self)->&Vec<Employee>{
        &self.emp
    }

    fn remove_employee(&mut self, emp_id:u64) {
        self.emp.retain(|e| e.id != emp_id);
    }
}


//####################################################################################

struct Employee {
    id: u64,
    company_ids: Vec<String>,
    principal: String,
    full_name: String,
    added_at: u64,
}

impl Employee {
    async fn gen_proof(&self,company_index:u64) -> Proof {
        let random_code = generate_random_code(10).await;
        let now = ic_cdk::api::time();
        let company_id = &self.company_ids[company_index as usize];
        let proof_id=0; //toDo get frome stable memo
        Proof {
            code: format!("{}-{}-{}",company_id, random_code,proof_id),
            company_id: company_id.clone(),
            employee_id: self.id.clone(),
            created_at: now,
            expires_at: now + (24 * 60 * 60 * 1_000_000_000),
            is_used: false,
        }
    }
}


//####################################################################################


struct Proof {
    code: String,
    company_id: String,
    employee_id: u64,
    created_at: u64,
    expires_at: u64,
    is_used: bool,
}

//####################################################################################
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
async fn generate_proof(company_index:u64) -> String {
    let caller_principal = ic_cdk::caller();
    let user_id = caller_principal.to_text();

//    let e = EMPLOYEES.with(|m| m.borrow().get(&user_id).unwrap());

    let e = Employee {
        id: 0,
        company_ids: vec!["Mercatura".to_string(),"Company99".to_string(),"Merca".to_string()],
        principal: user_id.clone(),
        full_name: "Abdelrahman".to_string(),
        added_at: ic_cdk::api::time(),
    };
    e.gen_proof(company_index).await.code
}

#[ic_cdk::query]
fn list_my_companies() -> Vec<String> {
    let caller_principal = ic_cdk::caller();
    let user_id = caller_principal.to_text();

//    let e = EMPLOYEES.with(|m| m.borrow().get(&user_id).unwrap());

    let e = Employee {
        id: 0,
        company_ids: vec!["Mercatura".to_string(),"Company99".to_string(),"Merca".to_string()],
        principal: user_id.clone(),
        full_name: "Abdelrahman".to_string(),
        added_at: ic_cdk::api::time(),
    };
    e.company_ids
}

#[ic_cdk::query]
fn verify_proof(proof_code: String) -> bool {
    return true;// toDo
}

ic_cdk::export_candid!();