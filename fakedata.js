const {faker} = require("@faker-js/faker")

data=[]

const user =()=>{
  return [
     
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  
  ];
}

for (let i=1;i<=100;i++){
    data.push(user());
}

module.exports = data