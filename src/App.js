import React from "react"
import {Item} from './components/Item.js'
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection,onSnapshot,
  addDoc,deleteDoc,doc,
  query,
  orderBy,serverTimestamp,
 

} from 'firebase/firestore'
import {
getAuth, createUserWithEmailAndPassword,
signOut,signInWithEmailAndPassword,
onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBy57Qe7bNxqq8JoPUwuhwCGF301sp2-Bk",
  authDomain: "shopping-cart-13435.firebaseapp.com",
  projectId: "shopping-cart-13435",
  storageBucket: "shopping-cart-13435.appspot.com",
  messagingSenderId: "636474964316",
  appId: "1:636474964316:web:fb698519d06e64e2f36999"
};
initializeApp(firebaseConfig)
  //init services
  const db = getFirestore()
  const auth = getAuth()
//collection name
let userCollection = localStorage.getItem('userCollection')?localStorage.getItem('userCollection'):'n'

  //collection ref
  let colRef = collection(db,userCollection)


 
  

function App() {
  const email = localStorage.getItem('user-email')?localStorage.getItem('user-email'):''
  const [inputText,setInputText] = React.useState('')
  const [items,setItems] = React.useState([])
  const [formInputs, setFormInputs] = React.useState({});
  const [user,setUser] = React.useState('')
  const [errorMessage,setErrorMessage] = React.useState('')
  const [userEmail, setUserEmail] = React.useState(email)
    //queries
    const q = query(colRef,orderBy('createdAt'))
   //real time collection data

   const unsubCol = onSnapshot(q,(snapshot)=>{
  
   
        let products = []
        for(let el of snapshot.docs){
          products.push({...el.data(),id:el.id})
     }
     setItems(products)
      
  
      
  })
 
//subscribing to auth changes
React.useEffect(()=>{
  const unsubAuth = onAuthStateChanged(auth,(user)=>{
    setUser(user)
   
  })
},[user])
/*form functions*/
const handleFormChange = (event) => {
  const name = event.target.name;
  const value = event.target.value;
  setFormInputs(values => ({...values, [name]: value}))
 
}

const handleSubmit = (event) => {
      event.preventDefault();
      createUserWithEmailAndPassword(auth,formInputs.email,formInputs.password)
      .then((cred)=>{
        console.log('user created:',cred.user)
        setUserEmail(cred.user.email)
        localStorage.setItem('userCollection',cred.user.uid)
        userCollection = cred.user.uid
        colRef = collection(db,userCollection)
        setFormInputs({})
      })
      .catch((err)=>{
        setErrorMessage(err.message)
      })
  }
function logIn(){
  signInWithEmailAndPassword(auth,formInputs.email,formInputs.password)
  .then((cred)=>{
      localStorage.setItem('user-email',cred.user.email)
      setUserEmail(cred.user.email)
      localStorage.setItem('userCollection',cred.user.uid)
      userCollection = cred.user.uid
      colRef = collection(db,userCollection)
      setFormInputs({})
  })
  .catch((err)=>{
    setErrorMessage(err.message)
  })
}
function logOut(){
  signOut(auth)
  .then(()=>{
    localStorage.clear()
    unsubCol()
   

  })
  .catch((err)=>{console.log(err.message)})
}
//cart functions
function handleChange(e){
   setInputText(e.target.value)
 
}
function addToCart(){
  if(inputText){
    addDoc(colRef,{
      text:inputText,
      createdAt:serverTimestamp()
    })
    .then(()=>{
      setInputText('')
    })
  }
  
}
//delete document
function deleteItem(id){
  const docRef = doc(db,userCollection,id)
  deleteDoc(docRef)
  
}


const itemsHtml = items.map(el=>{
  return (
  <Item
    key={el.id}
    id={el.id}
    text={el.text}
    delete={deleteItem}

  />
  )
  
  
})
  return (
    !user?
  <form onSubmit={handleSubmit}>
    <img className='cat' src='../assets/cat.png' alt="cat picture"></img>
    <label>Enter your email: </label>
    <input 
       type="email" 
       name="email" 
       value={formInputs.email || ""} 
       onChange={handleFormChange}
       />
    <label>Enter your password: </label>
    <input 
       type="password" 
       name="password" 
       value={formInputs.password || ""} 
       onChange={handleFormChange}
       />
    <div className='form-btns'>
       <button type="submit">sign up</button>
       <button className="log-in-btn" type="button" onClick={logIn}>log in</button>
    </div>
    <p className="error">{errorMessage}</p>
    
   
 </form> :
    <div className="container">
      <h2 className="user-email">{userEmail}</h2>
      <img className='cat' src='../assets/cat.png' alt="cat picture"></img>
      <input type="text" onChange={handleChange} value={inputText} id="input-field" placeholder="Add your item"></input>
      <button id="add-button" onClick={addToCart} >Add to cart</button>
      <button className='log-out-btn'id='logOut-button' onClick={logOut}>log out</button>
      
      <ul id="shopping-list" className="shopping-list"> 
        {itemsHtml}
      </ul>

  </div>
  );
}

export default App;
