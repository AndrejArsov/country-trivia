
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
// Initialize Firebase
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
      highScore: 0,
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

  async updateHighScore(newScore: number): Promise<void> {
    if (!this.currentUser) throw new Error("No authenticated user");
    const uid = this.currentUser.uid;
    const userRef = doc(this.firestore, "users", uid);
    await updateDoc(userRef, { highScore: newScore });
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

  async saveScore(name: string, score: number) {
    await addDoc(collection(this.firestore, "scores"), {
      name,
      score,
      date: new Date()
    });
  }

  async getScores() {
  const scoresQuery = query(
    collection(this.firestore, "scores"),
    orderBy("score", "desc")  // sort descending by "score"
  );
  const snapshot = await getDocs(scoresQuery);
  return snapshot.docs.map((doc) => doc.data());
}
  
  async getUsers() {
    const scoresQuery = query(
      collection(this.firestore, "users"),
      orderBy("gamesPlayed", "desc")  // sort descending by "gamesPlayed"
    );
    const snapshot = await getDocs(scoresQuery);
    return snapshot.docs.map((doc) => doc.data());
  }

  async getHighScore() {
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
      return docSnap.data()!["highScore"];
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
  
  async deleteScoresByName(name: string): Promise<void> {
    const scoresRef = collection(this.firestore, "scores");
    const q = query(scoresRef, where("name", "==", name));
    const snapshot = await getDocs(q);

    const batch = writeBatch(this.firestore);

    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }

}
