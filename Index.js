//Get random users, let's keep it easy and use fetch javascript method and use lightWeiht knockout Js libray,
//angular or reactJs would be over kill for this solution.

class User{
    constructor(){

        this.userData=ko.observable();
        this.displayText=ko.observable();
        this.userPictureUrl=ko.observable();
        this.headTitle=ko.observable();
        this.isOnload=ko.observable(false);
    }
    getRandomUsers =()=>{

     fetch('https://randomuser.me/api/')
    .then((res)=> {
        return res.json();
    })
    .then((users)=>{
        console.log(users.results);
       
        this.userData(users.results);
        this.userPictureUrl( this.userData()[0].picture.large);
        this.getUserFullName();
        this.isOnload(true);
        localStorage.setItem("coordinates",JSON.stringify(this.userData()[0].location.coordinates));
    })
    .catch((error)=> console.log(new Error('error occured')))  
    }

    getUserFullName = ()=>{
     this.headTitle(`Hi, My name is`);
     this.displayText(`${this.userData()[0].name.first} ${this.userData()[0].name.last}`);
   }
   getUserEmail = ()=>{
    this.headTitle(`My email address is`);
    this.displayText(`${this.userData()[0].email}`);
    this.isOnload(false);
  }
  getUserBirthDay= ()=>{
    this.headTitle(`My birthday is`);
    this.displayText(`${new Date(this.userData()[0].dob.date || '').toDateString()} `);
    this.isOnload(false);
  }
  getUserAddress= ()=>{
    this.headTitle(`My address is`);
    this.displayText(`${this.userData()[0].location.country || ''},
    ${this.userData()[0].location.city || ''} 
    ,${this.userData()[0].location.street.name|| ''},
    ${this.userData()[0].location.postcode || ''}`);
  }
  getUserCellPhone =()=>{
   this.headTitle(`My phone number is`);
   this.displayText(`${this.userData()[0].cell}`);
   this.isOnload(false);
  }
  getUserPassword= ()=>{
    this.headTitle(`My password is`);
    this.displayText(`${this.userData()[0].login.password}`);
    this.isOnload(false);
  }
  showNextUser=()=>{
      this.getRandomUsers();
  }
}
ko.applyBindings(new User());