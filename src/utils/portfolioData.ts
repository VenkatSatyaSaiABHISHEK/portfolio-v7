import { db, isFirebaseConfigured } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { person, social, newsletter, home, about, blog, work, gallery } from "../resources/content";

export interface PortfolioData {
  person: typeof person;
  social: typeof social;
  newsletter: typeof newsletter;
  home: typeof home;
  about: typeof about;
  blog: typeof blog;
  work: typeof work;
  gallery: typeof gallery;
  projects?: any[];
}

export function getDefaultPortfolioData(): PortfolioData {
  return { person, social, newsletter, home, about, blog, work, gallery, projects: [] };
}

export async function getPortfolioData(): Promise<PortfolioData & { _firestoreError?: string }> {
  let result: PortfolioData | null = null;
  let firestoreError: string | undefined;
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "portfolio", "data");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        result = docSnap.data() as PortfolioData;
      }
    } catch (e: any) {
      console.error("Error reading from Firestore:", e);
      if (e.code === "permission-denied") {
        firestoreError = "permission-denied";
      } else {
        firestoreError = e.message || String(e);
      }
    }
  }

  // Fallback to local file src/resources/db_fallback.json
  if (!result) {
    try {
      const fallbackPath = path.join(process.cwd(), "src", "resources", "db_fallback.json");
      if (fs.existsSync(fallbackPath)) {
        const data = fs.readFileSync(fallbackPath, "utf-8");
        result = JSON.parse(data);
      }
    } catch (e) {
      console.error("Error reading db_fallback.json:", e);
    }
  }

  const finalData = (result || getDefaultPortfolioData()) as PortfolioData & { _firestoreError?: string };
  if (!finalData.projects) {
    finalData.projects = [];
  }
  if (firestoreError) {
    finalData._firestoreError = firestoreError;
  }
  return finalData;
}

export async function savePortfolioData(data: PortfolioData): Promise<{ success: boolean; error?: string }> {
  let firestoreSuccess = false;
  let firestoreError: string | undefined;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "portfolio", "data");
      const cleanData = { ...data };
      delete (cleanData as any)._firestoreError;

      await setDoc(docRef, cleanData);
      firestoreSuccess = true;
    } catch (e: any) {
      console.error("Error writing to Firestore:", e);
      firestoreError = e.code === "permission-denied"
        ? "Firestore write permission denied. Please verify your Firestore Security Rules."
        : (e.message || String(e));
    }
  }

  // Always write to local file src/resources/db_fallback.json as a backup
  try {
    const fallbackPath = path.join(process.cwd(), "src", "resources", "db_fallback.json");
    const cleanData = { ...data };
    delete (cleanData as any)._firestoreError;
    fs.writeFileSync(fallbackPath, JSON.stringify(cleanData, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing to db_fallback.json:", e);
    if (!isFirebaseConfigured) {
      return { success: false, error: "Failed to write local database fallback." };
    }
  }

  if (isFirebaseConfigured && !firestoreSuccess) {
    return { success: false, error: firestoreError || "Firebase write failed." };
  }

  return { success: true };
}
