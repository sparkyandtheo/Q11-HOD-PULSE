import { db } from './firebase.js';
import { notify, showSaveStatus } from './ui.js';

export async function persistRecord(data, currentRecordData, currentUser, manual = false) {
    if (!currentUser) {
        if (manual) notify("Please sign in to save jobs.");
        return;
    }

    const recordToSave = { ...currentRecordData, ...data };

    recordToSave.owner = currentUser.uid;
    if (!recordToSave.createdAt) {
        recordToSave.createdAt = new Date().toISOString();
    }
    recordToSave.editedAt = new Date().toISOString();

    const textForTokens = [recordToSave.name, recordToSave.phone, recordToSave.jobsite, recordToSave.request, recordToSave.tsNumber, recordToSave.docId].join(' ');
    recordToSave.tokens = textForTokens.toLowerCase().split(/\s+/).filter(Boolean);

    try {
        const docRef = recordToSave.id ? db.collection("records").doc(recordToSave.id) : db.collection("records").doc();
        await docRef.set(recordToSave, { merge: true });
        
        const intakeForm = document.getElementById('intakeForm');
        intakeForm.dataset.editing = docRef.id;
        
        recordToSave.id = docRef.id;

        if (manual) {
            notify('✅ Job Saved to Firebase!');
        } else {
            showSaveStatus('Auto-saved');
        }

        return recordToSave;
    } catch (error) {
        console.error("Failed to save job to Firebase:", error);
        notify("❌ Error saving job to Firebase. See console for details.");
    }
}

export async function performSearch(currentUser, queryString) {
    if (!currentUser || !queryString) {
        return [];
    }

    let query = db.collection("records").where("owner", "==", currentUser.uid);
    const searchTerms = queryString.toLowerCase().split(' ').filter(Boolean);

    query = query.where('tokens', 'array-contains-any', searchTerms);

    try {
        const snapshot = await query.orderBy('editedAt', 'desc').limit(10).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Search query failed:", error);
        if (error.code === 'failed-precondition') {
            notify("A Firestore index is required for this search. Check the console for a link to create it.");
        } else {
            notify("Search failed.");
        }
        return [];
    }
}

export async function fetchJobById(jobId) {
    try {
        const doc = await db.collection("records").doc(jobId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        } else {
            notify("Error: Job not found.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching job:", error);
        return null;
    }
}
