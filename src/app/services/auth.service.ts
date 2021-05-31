import { Injectable, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { UserService } from "./user.service";


export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit {

  userData: any;

  isauthenticated: boolean = false;

  signupUrl: string
    = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCYroLcNUSv3PihR38oy6jk584qb3E8cMo'

  signinUrl: string
    = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCYroLcNUSv3PihR38oy6jk584qb3E8cMo'

  userCollection: AngularFirestoreCollection<any>;

  constructor(
    private userService: UserService,
    private router: Router,
    private fireAuth: AngularFireAuth,
    private firestore: AngularFirestore,

  ) {
    this.userCollection = this.firestore.collection<any>('users');
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
      }
      else {
        localStorage.setItem('user', null);
      }
    })
  }

  ngOnInit() {
  }

  signup(user: User, password: string) {
    return this.fireAuth.createUserWithEmailAndPassword(user.userEmail, password)
      .then(result => {
        this.setUserData(result.user.uid, user);
        this.router.navigate(['login']);
      })
      .catch(error => {
        window.alert(error.message);
      })
  }

  login(email: string, password: string) {
    return this.fireAuth.signInWithEmailAndPassword(email, password)
      .then(result => {
        this.isauthenticated = true;
        this.router.navigate(['trips']);
        // this.setUserData()
      })
      .catch(error => {
        console.log(error);;

      })
  }

  setUserData(userRef: string, user: User) {

    let tempUser = new User(
      user.userFullName,
      user.userEmail,
      user.userContactNo,
      user.isVehicleOwner,
      userRef,
      null, null, null
    )
    return this.userCollection.doc(user.userId).set(Object.assign({}, tempUser), {
      merge: true
    })
  }


  logout() {
    this.isauthenticated = false;
    return this.fireAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    })
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && this.isauthenticated) ? true : false;
  }


}



