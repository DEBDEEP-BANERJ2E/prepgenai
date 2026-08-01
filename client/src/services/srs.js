// SM-2 Algorithm Implementation for Flashcards

const SRS_KEY = 'prepgen_srs';

const getDeck = () => {
  return JSON.parse(localStorage.getItem(SRS_KEY) || '{}');
};

const saveDeck = (deck) => {
  localStorage.setItem(SRS_KEY, JSON.stringify(deck));
};

export const initCardsForNote = (note) => {
  if (!note || !note.content || !note.content.revisionPoints) return;
  
  const deck = getDeck();
  let modified = false;

  note.content.revisionPoints.forEach((point, index) => {
    const cardId = `${note._id}_${index}`;
    if (!deck[cardId]) {
      deck[cardId] = {
        id: cardId,
        noteId: note._id,
        topic: note.topic,
        text: point,
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        dueDate: new Date().toISOString() // Due immediately
      };
      modified = true;
    }
  });

  if (modified) saveDeck(deck);
};

export const getDueCards = () => {
  const deck = getDeck();
  const now = new Date();
  
  return Object.values(deck).filter(card => new Date(card.dueDate) <= now);
};

export const getTotalCards = () => {
    return Object.keys(getDeck()).length;
}

// quality: 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
// Mapped to SM-2 qualities: 1, 3, 4, 5
export const processReview = (cardId, userQuality) => {
  const deck = getDeck();
  const card = deck[cardId];
  if (!card) return null;

  let { repetition, interval, easeFactor } = card;

  // Map 0-3 to SM-2 0-5 scale roughly
  let quality;
  if (userQuality === 0) quality = 1; // Again (Complete blackout)
  else if (userQuality === 1) quality = 3; // Hard
  else if (userQuality === 2) quality = 4; // Good
  else if (userQuality === 3) quality = 5; // Easy

  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate next due date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  deck[cardId] = {
    ...card,
    repetition,
    interval,
    easeFactor,
    dueDate: nextDate.toISOString()
  };

  saveDeck(deck);
  return deck[cardId];
};
