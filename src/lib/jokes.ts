export const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "I'm reading a book on anti-gravity. It's impossible to put down!",
  "What do you call a fake noodle? An Impasta!",
  "Why can't a bicycle stand up by itself? It's two tired.",
  "Did you hear about the restaurant on the moon? Great food, no atmosphere.",
  "What do you call a fish with no eyes? Fsh.",
  "Why did the coffee file a police report? It got mugged.",
  "How does a penguin build its house? Igloos it together.",
];

export const getRandomJoke = () => {
  return jokes[Math.floor(Math.random() * jokes.length)];
};
