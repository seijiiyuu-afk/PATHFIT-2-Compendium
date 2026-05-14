import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage } from './config';

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (err) {
  console.log('Persistence already enabled or not supported');
}

// ====== AUTH SERVICES ======

const ADMIN_EMAIL = 'tahoo@pathfit2.com';
const ADMIN_PASSWORD = 'tahoo198725';

// Create admin account on first load
export const setupAdminAccount = async (): Promise<void> => {
  try {
    await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Admin account created');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists');
    } else {
      console.error('Error creating admin:', error);
    }
  }
};

export const loginAdmin = async (username: string, password: string): Promise<FirebaseUser | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, `${username}@pathfit2.com`, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid username or password');
  }
};

export const logoutAdmin = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ====== FIRESTORE SERVICES ======

export interface SiteData {
  published: boolean;
  publishDate?: string;
  members: MemberData[];
  activities: ActivityData[];
  reflections: ReflectionData[];
  [key: string]: any;
}

export interface MemberData {
  id: number;
  name: string;
  course: string;
  bio: string;
  hobbies: string;
  goal: string;
  photoUrl: string;
  studentProfileUrl: string;
  parqUrl: string;
  trainingProgramUrl: string;
  jogTrackUrl: string;
  reflectionPhotoUrl: string;
}

export interface ActivityData {
  id: number;
  title: string;
  description: string;
  objectives: string;
  learnings: string;
  imageUrl: string;
}

export interface ReflectionData {
  id: number;
  name: string;
  content: string;
}

export interface PageContent {
  [pageId: string]: {
    [fieldId: string]: string;
  };
}

const SITE_DOC_ID = 'pathfit2-site';
const CONTENT_DOC_ID = 'pathfit2-content';

export const getSiteData = async (): Promise<SiteData | null> => {
  try {
    const docRef = doc(db, 'sites', SITE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteData;
    }
    return null;
  } catch (error) {
    console.error('Error getting site data:', error);
    return null;
  }
};

export const saveSiteData = async (data: Partial<SiteData>): Promise<void> => {
  try {
    const docRef = doc(db, 'sites', SITE_DOC_ID);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, data);
    }
  } catch (error) {
    console.error('Error saving site data:', error);
    throw error;
  }
};

export const getPageContent = async (): Promise<PageContent> => {
  try {
    const docRef = doc(db, 'content', CONTENT_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as PageContent;
    }
    return {};
  } catch (error) {
    console.error('Error getting page content:', error);
    return {};
  }
};

export const savePageContent = async (pageId: string, fieldId: string, value: string): Promise<void> => {
  try {
    const docRef = doc(db, 'content', CONTENT_DOC_ID);
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      const data = existing.data() as PageContent;
      if (!data[pageId]) data[pageId] = {};
      data[pageId][fieldId] = value;
      await updateDoc(docRef, data);
    } else {
      await setDoc(docRef, {
        [pageId]: {
          [fieldId]: value,
        },
      });
    }
  } catch (error) {
    console.error('Error saving page content:', error);
    throw error;
  }
};

export const getPublishedStatus = async (): Promise<boolean> => {
  try {
    const siteData = await getSiteData();
    return siteData?.published ?? false;
  } catch {
    return false;
  }
};

export const publishSite = async (): Promise<void> => {
  await saveSiteData({
    published: true,
    publishDate: new Date().toISOString(),
  });
};

export const unpublishSite = async (): Promise<void> => {
  await saveSiteData({
    published: false,
    publishDate: undefined,
  });
};

// ====== STORAGE SERVICES ======

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `pathfit2/${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Fallback: return base64 for demo if Firebase Storage not configured
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// ====== INITIALIZE DATA ======

export const initializeDefaultData = async (): Promise<void> => {
  const existing = await getSiteData();
  if (!existing) {
    const defaultData: SiteData = {
      published: false,
      members: Array.from({ length: 9 }, (_, i) => ({
        id: i,
        name: `[Member ${i + 1} Full Name]`,
        course: '[Course/Year - e.g. BSTM 1-B]',
        bio: `Hi! I am [First Name], a [year level] student taking up [course] at Sorsogon State University. I am passionate about [hobby/interest] and I joined PATHFIT 2 to improve my endurance and maintain a healthy lifestyle. In my free time, I enjoy [hobby]. I hope to grow not just physically but also mentally through this course.`,
        hobbies: '[List your hobbies]',
        goal: '[Your fitness goal - e.g. Build stamina]',
        photoUrl: '',
        studentProfileUrl: '',
        parqUrl: '',
        trainingProgramUrl: '',
        jogTrackUrl: '',
        reflectionPhotoUrl: '',
      })),
      activities: [
        {
          id: 1,
          title: '[Activity 1 - Title]',
          description: 'This activity focused on [description of activity]. The objective was to [objective]. As a group, we learned [learnings and experiences].',
          objectives: '[List objectives]',
          learnings: '[What did you learn?]',
          imageUrl: '',
        },
        {
          id: 2,
          title: '[Activity 2 - Title]',
          description: 'This activity focused on [description of activity]. The objective was to [objective]. As a group, we learned [learnings and experiences].',
          objectives: '[List objectives]',
          learnings: '[What did you learn?]',
          imageUrl: '',
        },
        {
          id: 3,
          title: '[Activity 3 - Title]',
          description: 'This activity focused on [description of activity]. The objective was to [objective]. As a group, we learned [learnings and experiences].',
          objectives: '[List objectives]',
          learnings: '[What did you learn?]',
          imageUrl: '',
        },
      ],
      reflections: Array.from({ length: 9 }, (_, i) => ({
        id: i,
        name: `[Member ${i + 1} Full Name]`,
        content: `Throughout my journey in PATHFIT 2, I experienced both physical and personal challenges that helped me grow in many ways. At the beginning of the semester, I found it difficult to maintain a consistent workout routine, but as the weeks went by, I learned to push through my limits and stay committed to my goals.\n\nThe activities we did as a group and individually taught me the value of discipline, consistency, and perseverance. I realized that physical fitness is not just about the body — it is also about mental strength and determination. One of my most memorable moments was completing the 4-week training program, which made me proud of how far I had come.\n\nLooking back, I am grateful for the experiences this course gave me. I now have a deeper appreciation for physical activity and its role in maintaining a healthy and balanced lifestyle. I will carry these learnings with me beyond this class.`,
      })),
    };
    await saveSiteData(defaultData);
  }
};
