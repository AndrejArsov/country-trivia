
import { Injectable } from "@angular/core";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  addDoc,
  getDocs,
  collection,
  query,
  where,
  writeBatch,
  orderBy
} from "firebase/firestore";
import { environment } from "../enviroments/enviroment";

const apiKey = environment.apiKey

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "country-trivia-ae5d2.firebaseapp.com",
  projectId: "country-trivia-ae5d2",
  storageBucket: "country-trivia-ae5d2.appspot.com",
  messagingSenderId: "424976519112",
  appId: "1:424976519112:web:38d32b0ea3fca32ed17afd",
  measurementId: "G-GXS9HBLD7F"
};

const app = initializeApp(firebaseConfig);

@Injectable({
  providedIn: "root"
})
export class UserService {
  private auth = getAuth(app);
  private firestore: Firestore = getFirestore(app);
  private currentUser: User | null = null;

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUser = user;
        localStorage.setItem("uid", user.uid);
      } else {
        this.signInAnonymously();
      }
    });
  }

  async signInAnonymously(): Promise<void> {
    const result = await signInAnonymously(this.auth);
    this.currentUser = result.user;
    localStorage.setItem("uid", result.user.uid);
  }

  async createUserProfile(name: string): Promise<void> {
    if (!this.currentUser) throw new Error("No authenticated user");
    const uid = this.currentUser.uid;
    const userRef = doc(this.firestore, "users", uid);
    await setDoc(userRef, {
      name,
      easyHighScore: 0,
      hardHighScore: 0,
      gamesPlayed: 0,
      createdAt: new Date(),
      uid: this.currentUser.uid
    });
  }

  async loadUserProfile(): Promise<any> {
    let userId = localStorage.getItem("uid")

    if (!userId) {
      const credential = await signInAnonymously(this.auth);
      userId = credential.user.uid;
      this.currentUser = credential.user;
      localStorage.setItem("uid", userId);
    }

    const docRef = doc(this.firestore, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  async updateEasyHighScore(newScore: number): Promise<void> {
    if (!this.currentUser) throw new Error("No authenticated user");
    const uid = this.currentUser.uid;
    const userRef = doc(this.firestore, "users", uid);
    await updateDoc(userRef, { easyHighScore: newScore });
  }
  
  async updateHardHighScore(newScore: number): Promise<void> {
    if (!this.currentUser) throw new Error("No authenticated user");
    const uid = this.currentUser.uid;
    const userRef = doc(this.firestore, "users", uid);
    await updateDoc(userRef, { hardHighScore: newScore });
  }

  async incrementGamesPlayed(): Promise<void> {
    if (!this.currentUser) throw new Error("No authenticated user");
    const uid = this.currentUser.uid;
    const userRef = doc(this.firestore, "users", uid);
    await updateDoc(userRef, { gamesPlayed: increment(1) });
  }

  getCurrentUid(): string | null {
    return this.currentUser?.uid ?? null;
  }

  async saveEasyScore(name: string, score: number) {
    await addDoc(collection(this.firestore, "easyScores"), {
      name,
      score,
      date: new Date()
    });
  }
  async saveHardScore(name: string, score: number) {
    await addDoc(collection(this.firestore, "hardScores"), {
      name,
      score,
      date: new Date()
    });
  }

  async getEasyScores() {
    const scoresQuery = query(
      collection(this.firestore, "easyScores"),
      orderBy("score", "desc") 
    );
    const snapshot = await getDocs(scoresQuery);
    return snapshot.docs.map((doc) => doc.data());
  }
  async getHardScores() {
    const scoresQuery = query(
      collection(this.firestore, "hardScores"),
      orderBy("score", "desc") 
    );
    const snapshot = await getDocs(scoresQuery);
    return snapshot.docs.map((doc) => doc.data());
  }
  
  async getUsers() {
    const scoresQuery = query(
      collection(this.firestore, "users"),
      orderBy("gamesPlayed", "desc")
    );
    const snapshot = await getDocs(scoresQuery);
    return snapshot.docs.map((doc) => doc.data());
  }

  async getEasyHighScore() {
    let userId = localStorage.getItem("uid")

    if (!userId) {
      const credential = await signInAnonymously(this.auth);
      userId = credential.user.uid;
      this.currentUser = credential.user;
      localStorage.setItem("uid", userId);
    }

    const docRef = doc(this.firestore, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()!["easyHighScore"];
    } else {
      return null;
    }
  }
  async getHardHighScore() {
    let userId = localStorage.getItem("uid")

    if (!userId) {
      const credential = await signInAnonymously(this.auth);
      userId = credential.user.uid;
      this.currentUser = credential.user;
      localStorage.setItem("uid", userId);
    }

    const docRef = doc(this.firestore, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()!["hardHighScore"];
    } else {
      return null;
    }
  }

  async getUserName() {
    let userId = localStorage.getItem("uid")

    if (!userId) {
      const credential = await signInAnonymously(this.auth);
      userId = credential.user.uid;
      this.currentUser = credential.user;
      localStorage.setItem("uid", userId);
    }

    const docRef = doc(this.firestore, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()!["name"];
    } else {
      return null;
    }
  }
  
  async deleteEasyScoresByName(name: string): Promise<void> {
    const scoresRef = collection(this.firestore, "easyScores");
    const q = query(scoresRef, where("name", "==", name));
    const snapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);

    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }
  async deleteHardScoresByName(name: string): Promise<void> {
    const scoresRef = collection(this.firestore, "hardScores");
    const q = query(scoresRef, where("name", "==", name));
    const snapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);

    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }

}
