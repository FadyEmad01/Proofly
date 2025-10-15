
struct Company{
    
}

struct Employee{
    name:Stirng,
    Position:Stirng,
}

impl Employee{
    fn gen_proof(&self){

    }

}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

fn verify(proof:Stirng)->bool{

}