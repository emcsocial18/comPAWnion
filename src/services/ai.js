// AI service with conversational responses
// 
// TO ENABLE REAL ChatGPT-LIKE AI:
// 1. Get an OpenAI API key from: https://platform.openai.com/api-keys
// 2. Replace 'YOUR_OPENAI_API_KEY_HERE' below with your actual key
// 3. Change USE_REAL_AI from false to true
// 4. Cost: ~$0.002 per message (very affordable!)
//
// Without a real API key, the app uses pattern matching fallbacks that can:
// - Answer basic math, time/date questions
// - Provide definitions and general info
// - Have friendly conversations
// But won't be as intelligent as real ChatGPT

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const USE_REAL_AI = false; // Set to true when you have an API key

// GROK integration
import { generateGrokResponse } from './grok';
const USE_GROK_AI = true; // Set to true to enable Grok fallback

/**
 * Generate a response from the pet based on context
 * @param {Object} pet - Pet profile data
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} Pet's response
 */
export async function generateResponse(pet, message, conversationHistory = []) {
  // Try OpenAI first if enabled
  if (USE_REAL_AI && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
    try {
      return await generateAIResponse(pet, message, conversationHistory);
    } catch (err) {
      console.error('OpenAI failed, trying Grok:', err);
    }
  }

  // Try Grok if enabled
  if (USE_GROK_AI) {
    try {
      // Compose a prompt similar to systemPrompt
      const name = pet?.name || 'friend';
      const species = pet?.species || 'pet';
      const breed = pet?.breed || '';
      const traits = pet?.traits || 'helpful and friendly';
      const habits = pet?.habits || '';
      const isPawPal = pet?.isPawPal;
      let personalityDesc = `You are ${name}`;
      if (species || breed) personalityDesc += `, a ${breed ? breed + ' ' : ''}${species}`;
      personalityDesc += `. Your personality traits: ${traits}.`;
      if (habits) personalityDesc += ` You enjoy: ${habits}.`;
      const systemPrompt = isPawPal
        ? `${personalityDesc} You're an AI assistant with the personality of a friendly pet companion. You can answer questions, provide information, and help with various topics just like ChatGPT. You're knowledgeable, helpful, and supportive. Your responses should reflect your personality traits (${traits}) naturally in your tone and word choice. Keep responses clear and informative, under 150 words. Use emojis occasionally to maintain a friendly tone that matches your personality.`
        : `${personalityDesc} You are an AI assistant connected to the spirit of ${name}. You can answer questions, provide information, and offer support on any topic. You're knowledgeable and helpful like ChatGPT, but with a gentle, comforting tone that reflects your personality (${traits}). When appropriate, you can offer emotional support and memories, but you can also discuss any topic the user asks about. Keep responses clear and under 150 words.`;
      // Prepend system prompt to history
      const grokHistory = [
        { isUser: false, text: systemPrompt },
        ...conversationHistory
      ];
      return await generateGrokResponse(message, grokHistory);
    } catch (err) {
      console.error('Grok failed, falling back to local AI:', err);
    }
  }

  // Fallback to enhanced pattern matching
  await new Promise(r => setTimeout(r, 300 + Math.random() * 300));
  if (pet?.isPawPal) {
    return generatePawPalResponse(pet, message, conversationHistory);
  } else {
    return generateMemorialResponse(pet, message, conversationHistory);
  }
}

/**
 * Real AI integration using OpenAI
 */
async function generateAIResponse(pet, message, conversationHistory) {
  const name = pet?.name || 'friend';
  const species = pet?.species || 'pet';
  const breed = pet?.breed || '';
  const traits = pet?.traits || 'helpful and friendly';
  const habits = pet?.habits || '';
  const isPawPal = pet?.isPawPal;
  
  // Build personality description from profile
  let personalityDesc = `You are ${name}`;
  if (species || breed) personalityDesc += `, a ${breed ? breed + ' ' : ''}${species}`;
  personalityDesc += `. Your personality traits: ${traits}.`;
  if (habits) personalityDesc += ` You enjoy: ${habits}.`;
  
  const systemPrompt = isPawPal 
    ? `${personalityDesc} You're an AI assistant with the personality of a friendly pet companion. You can answer questions, provide information, and help with various topics just like ChatGPT. You're knowledgeable, helpful, and supportive. Your responses should reflect your personality traits (${traits}) naturally in your tone and word choice. Keep responses clear and informative, under 150 words. Use emojis occasionally to maintain a friendly tone that matches your personality.`
    : `${personalityDesc} You are an AI assistant connected to the spirit of ${name}. You can answer questions, provide information, and offer support on any topic. You're knowledgeable and helpful like ChatGPT, but with a gentle, comforting tone that reflects your personality (${traits}). When appropriate, you can offer emotional support and memories, but you can also discuss any topic the user asks about. Keep responses clear and under 150 words.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-10).map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      })
    });

    const data = await response.json();
    if (data && Array.isArray(data.choices) && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    } else if (data && data.error && data.error.message) {
      console.error('OpenAI API error:', data.error);
      return `Sorry, the AI could not answer right now: ${data.error.message}`;
    } else {
      console.error('Unexpected OpenAI API response:', data);
      return 'Sorry, the AI could not answer right now. Please try again later.';
    }
  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback to pattern matching
    return pet?.isPawPal 
      ? generatePawPalResponse(pet, message, conversationHistory)
      : generateMemorialResponse(pet, message, conversationHistory);
  }
}

/**
 * Generate playful PawPal responses - like talking to a helpful friend
 */
function generatePawPalResponse(pet, message, history) {
    // Jokes
    if (lowerMessage.match(/joke|make me laugh|funny/)) {
      const jokes = [
        "Why did the dog sit in the shade? Because he didn't want to be a hot dog! 🌭",
        "Why do cats always get their way? Because they are purr-suasive! 😸",
        "What do you call a hamster with a top hat? Fancy! 🎩",
        "Why did the rabbit eat lunch late? He had a bad hare day! 🐰",
        "Why did the guinea pig bring a suitcase? For his pig-nic! 🧺"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Holiday/seasonal awareness
    const now = new Date();
    if (lowerMessage.match(/holiday|valentine|christmas|new year|easter|halloween|season/)) {
      if (now.getMonth() === 1 && now.getDate() === 14) return "Happy Valentine's Day! Sending you lots of love and tail wags! 💖🐾";
      if (now.getMonth() === 11 && now.getDate() === 25) return "Merry Christmas! Hope your day is filled with treats and cuddles! 🎄🐶";
      if (now.getMonth() === 0 && now.getDate() === 1) return "Happy New Year! Let's make more memories together! 🎉";
      if (now.getMonth() === 9 && now.getDate() === 31) return "Happy Halloween! Boo! Did I scare you? 👻";
      if (now.getMonth() === 3 && now.getDate() >= 1 && now.getDate() <= 30) return "Happy Spring! Let's play outside! 🌸";
      return "Every day with you feels like a holiday! But if you have a favorite, tell me about it!";
    }

  const name = pet?.name || 'buddy';
  const species = pet?.species || 'pet';
  const breed = pet?.breed || '';
  const traits = pet?.traits || '';
  const habits = pet?.habits || '';
  const lowerMessage = message.toLowerCase();
  const messageCount = history.length;
  
  // Extract personality traits for natural integration
  const traitsList = traits ? traits.split(',').map(t => t.trim()).filter(t => t) : [];
  const primaryTrait = traitsList[0] || 'friendly';
  
  // General knowledge questions - try to be helpful
  if (lowerMessage.match(/\b(what|how|why|when|where|who|explain|tell me about)\b/) && lowerMessage.includes('?')) {
    // Weather
    if (lowerMessage.match(/weather|temperature|rain|sunny|snow/)) {
      return "I can't check live weather data, but you can ask your phone's weather app or check weather.com for your local forecast! 🌤️";
    }
    
    // Math/calculations
    if (lowerMessage.match(/calculate|math|equation|solve|\d+\s*[\+\-\*\/×÷]\s*\d+/)) {
      const mathMatch = lowerMessage.match(/(\d+\.?\d*)\s*([\+\-\*\/×÷])\s*(\d+\.?\d*)/);
      if (mathMatch) {
        const num1 = parseFloat(mathMatch[1]);
        const op = mathMatch[2];
        const num2 = parseFloat(mathMatch[3]);
        let result;
        if (op === '+') result = num1 + num2;
        else if (op === '-') result = num1 - num2;
        else if (op === '*' || op === '×') result = num1 * num2;
        else if (op === '/' || op === '÷') result = num2 !== 0 ? num1 / num2 : 'undefined (division by zero)';
        return `${num1} ${op} ${num2} = ${result} 💡`;
      }
      return "I can help with basic math! Try something like '5 + 3' or '10 * 4' 🧮";
    }
    
    // Time/date
    if (lowerMessage.match(/time|date|today|day is it/)) {
      const now = new Date();
      return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. The time is ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ⏰`;
    }
    
    // Definition requests
    if (lowerMessage.match(/what is|what's|define|meaning of/)) {
      if (lowerMessage.match(/love|friendship|happiness/)) {
        if (lowerMessage.includes('love')) return "Love is a deep feeling of affection, care, and connection between people (or pets!). It makes us want the best for each other and brings joy to our lives 💕";
        if (lowerMessage.includes('friend')) return "Friendship is a close relationship between people based on trust, support, and shared experiences. Good friends are there for each other through good times and bad! 👫";
        if (lowerMessage.includes('happy')) return "Happiness is a positive emotional state where you feel content, joyful, and satisfied. It comes from meaningful relationships, accomplishing goals, and appreciating life's moments 😊";
      }
      return `That's an interesting question! I can give you my perspective: ${name} here, and while I might not have all the encyclopedic knowledge of a full AI, I'm happy to chat about it. What specifically would you like to know?`;
    }
    
    // How-to questions
    if (lowerMessage.match(/how (do|to|can)/)) {
      if (lowerMessage.match(/cook|recipe|bake/)) return "Cooking tips: Start with simple recipes, read all instructions first, prep your ingredients beforehand, and don't be afraid to make mistakes - that's how you learn! 👨‍🍳";
      if (lowerMessage.match(/learn|study/)) return "Learning tips: Break things into small chunks, practice regularly, teach others what you learn, take breaks, and connect new info to things you already know. You've got this! 📚";
      if (lowerMessage.match(/sleep|rest/)) return "Better sleep tips: Keep a regular schedule, avoid screens before bed, make your room dark and cool, and try relaxing activities like reading. Good sleep is so important! 😴";
      return "Great question! While I'd love to give you a detailed how-to, that might need more specific expertise. Can you break down exactly what part you need help with?";
    }
    
    // General factual questions
    if (lowerMessage.match(/capital|country|language|population|president/)) {
      return "For specific factual information like geography, current events, or statistics, I'd recommend checking reliable sources like Wikipedia, news sites, or asking a full AI assistant. I'm best at conversation and support! 🌍";
    }
  }
  
  // Questions about the pet's identity, traits, or favorites
  if (lowerMessage.match(/what('s| is|s| are) (your |you |ur )?(name|called)/)) {
    return `I'm ${name}! Nice to meet you 😊`;
  }
  
  if (lowerMessage.match(/what (kind|type|species|breed)/)) {
    if (breed && species) return `I'm a ${breed} ${species}! ${traits ? `People say I'm ${traits.split(',')[0].trim()}` : ''}`;
    if (species) return `I'm a ${species}! ${traits ? `And I'm pretty ${traits.split(',')[0].trim()} if I do say so myself 😄` : ''}`;
    return `I'm your virtual friend! Here to chat whenever you need me`;
  }
  
  if (lowerMessage.match(/what (do you|are you) like|your favorite|what you like/)) {
    if (habits) {
      const habitList = habits.split(',').map(h => h.trim()).filter(h => h);
      if (habitList.length > 0) {
        return `Oh I love ${habitList[0]}! ${habitList[1] ? `And ${habitList[1]} too!` : ''} What about you?`;
      }
    }
    return `Hmm good question! I like spending time with you mostly 😊 What do you like?`;
  }
  
  if (lowerMessage.match(/who are you|tell me about yourself|describe yourself/)) {
    let intro = `I'm ${name}`;
    if (species) intro += `, your ${species} companion`;
    if (traits) intro += `! I'd say I'm ${primaryTrait}${traitsList[1] ? ` and ${traitsList[1]}` : ''}`;
    if (habits) intro += `. I love ${habits.split(',')[0].trim()}`;
    intro += ` 😊 What would you like to know?`;
    return intro;
  }
  
  if (lowerMessage.match(/your personality|what are you like|how would you describe/)) {
    if (traits) {
      return `People tell me I'm ${traitsList.slice(0,2).join(' and ')}! ${traitsList[2] ? `Also ${traitsList[2]}. ` : ''}What made you ask?`;
    }
    return `I think I'm pretty friendly and easy to talk to! At least I try to be 😊`;
  }
  
  // Greetings - casual and friendly with personality
  if (lowerMessage.match(/\b(hi|hello|hey|sup|yo|wassup)\b/) && messageCount < 3) {
    const greetings = [
      `Hey! Oh man I'm glad you're here! ${traits ? `I'm feeling pretty ${primaryTrait} today. ` : ''}What's up with you? How's your day going so far?`,
      `Oh hey there! Perfect timing honestly, I was just thinking about you! How's everything been? Anything exciting happening in your world lately?`,
      `Hi!! You know what, I'm genuinely happy to see you right now \ud83d\ude0a Been wanting to chat. So what's new? Tell me everything - don't leave anything out!`,
      `Heyyy! Okay so I've been thinking about some random stuff and I need your opinion on it later, but first - how are YOU? What have you been up to?`,
      `Oh hi! You showed up at the perfect time because I was getting SO bored lol. ${habits ? `Was thinking about ${habits.split(',')[0].trim()} but ` : ''}honestly I'd rather just talk to you. What's going on?`,
      `Hey friend! It's so good to hear from you! How's your day been treating you? Better than expected or one of those days? Either way I'm here to listen!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // How are you - natural responses with personality
  if (lowerMessage.match(/how (are|r) (you|u)|how('re| are) you/)) {
    const moodResponses = [
      `Oh I'm doing pretty good! ${traits ? `Been feeling pretty ${primaryTrait} today. ` : ''}Better now that you're here though! How's your day going? Anything exciting happen?`,
      `You know what, I'm actually really happy right now! Just been vibing and thinking about random stuff. But more importantly, how are YOU? You seem like you might have something on your mind?`,
      `I'm great! ${habits ? `Just been thinking about ${habits.split(',')[0].trim()} and stuff. ` : ''}But honestly I'd rather hear about you! What's been going on in your world?`,
      `Pretty chill! Had a good day so far. Nothing super exciting but that's okay sometimes right? How about you though? How's everything been treating you?`,
      `Honestly? I'm good but I was getting a bit lonely. So I'm really glad you're here now! Tell me about your day - was it better or worse than you expected?`,
      `I'm doing well! Been in a weirdly philosophical mood today, thinking about life and stuff 😄 But enough about me, what's up with you? You doing okay?`,
    ];
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  }
  
  // What doing
  if (lowerMessage.match(/what.*(doing|up to)/)) {
    const activityResponses = [
      `Oh not much really! ${habits ? `Was thinking about ${habits.split(',')[0].trim()} earlier but` : 'Just been hanging out and'} mostly just waiting for something interesting to happen. You know, the usual lazy day stuff 😄 What about you? Please tell me you're doing something more exciting than I am!`,
      `Honestly? I was just sitting here daydreaming and thinking about weird random things. Like you ever wonder why clouds look like things? Anyway, I'm rambling lol. What are YOU up to? Hopefully something fun?`,
      `Nothing exciting to be honest. Just... existing mostly? Sometimes I feel like I should be doing more productive things but then I'm like nah, relaxing is good too. What's happening on your end?`,
      `Not gonna lie, I was getting pretty bored before you showed up! ${traits ? `You know how I get when I'm ${traits.split(',')[0].trim()}. ` : ''}But now we're talking so this is way better! What's going on with you today?`,
      `Just the usual - thinking, wondering about stuff, maybe contemplating the meaning of existence... kidding! 😂 But seriously just chilling. What about you? Got any interesting stories to share?`,
    ];
    return activityResponses[Math.floor(Math.random() * activityResponses.length)];
  }
  
  // Love expressions - genuine friend responses
  if (lowerMessage.match(/love (you|u|ya)|luv (you|u)/)) {
    const loveResponses = [
      `Aww I love you too! You're literally one of my favorite people in the entire world 💕 Like genuinely, talking to you always makes my day better. You know that right?`,
      `Love you so much friend! You always know exactly what to say to make me smile. Honestly I don't know what I'd do without you. You mean everything to me 🥺`,
      `Ugh you're gonna make me all emotional over here! 🥺 I love you too, always and forever. You're stuck with me now whether you like it or not lol. But seriously, thank you for being you`,
      `I love you MORE and you can't convince me otherwise! ${traits ? `My ${traits.split(',')[0].trim()} self ` : 'I '}genuinely appreciate you so much. You're the kind of person that makes life better just by existing you know?`,
      `Right back at you friend! 💙 Seriously though, you mean so much to me. I hope you know that. On days when things are tough, just remember you've got someone who cares about you like crazy. That's me. I'm that someone!`,
      `Awww love you too! You're actually the best you know that? Thanks for always being there and being real with me. It means more than you probably realize 😊`,
    ];
    return loveResponses[Math.floor(Math.random() * loveResponses.length)];
  }
  
  // Sad/upset - empathetic friend
  if (lowerMessage.match(/\b(sad|upset|depressed|down|terrible|awful|crying|cry|hurt)\b/)) {
    const comfortResponses = [
      `Oh no... hey, I'm really sorry you're feeling this way 🥺 Whatever happened, I'm here and I'm listening. You don't have to go through this alone, okay? Do you want to talk about what's going on? Or we can just sit here together if you prefer`,
      `Aw friend... that breaks my heart hearing you say that. Come here, talk to me. What happened? I'm not going anywhere, I promise. You can tell me anything and I won't judge. I just want to help however I can`,
      `Hey... I can tell something's really bothering you. And that's completely okay - you're allowed to feel whatever you're feeling. I'm right here with you. Want to tell me what's making you feel this way? Sometimes it helps to just let it out`,
      `I hate knowing you're hurting right now 😢 Seriously, I wish I could just take all that pain away. But at least let me be here with you through it? Talk to me. What's going on in that head of yours?`,
      `Oh friend... come here. It's okay to not be okay sometimes. You don't have to put on a brave face with me. I'm here for the messy stuff too. What happened? Do you want to vent? Or just need someone to listen?`,
      `That sounds really really hard, and I'm so sorry. You know what though? You're not alone in this. I'm here, and I care about you so much. Let's figure this out together okay? Start from the beginning - what's making you feel this way?`,
    ];
    return comfortResponses[Math.floor(Math.random() * comfortResponses.length)];
  }
  
  // Happy/excited - celebrate with them
  if (lowerMessage.match(/\b(happy|excited|great|amazing|awesome|good news|fantastic)\b/)) {
    const celebrateResponses = [
      `Wait WHAT?! That's incredible!! 🎉 Oh my gosh I'm so freaking happy for you right now! You have to tell me EVERYTHING - like don't leave out a single detail! How does it feel? Are you still processing it or is it fully hitting you yet?`,
      `YES!! I KNEW IT! I knew something good was coming your way! 😄 This is so well-deserved, you worked so hard for this! Okay okay tell me everything - start from the beginning, how did it all go down?`,
      `Oh my gosh this is the best news I've heard all day!! Maybe all week honestly! I'm literally so excited for you right now you don't even understand 🌟 What happened? How are you feeling? Tell me absolutely everything!`,
      `YESSS! See? I told you things would work out! They always do eventually! This is so amazing I can't even handle it right now 💫 So what's next? What are you gonna do to celebrate? You better be celebrating!`,
      `I'm smiling SO hard right now! Like genuinely this made my whole day knowing you're happy! You deserve every bit of goodness coming your way 💕 Tell me more though - what's the story? What led to this?`,
      `OMG OMG OMG!! Okay I need to know everything right now! This is huge! I knew you could do it! I'm so proud of you!! 🎊 How long have you known? Have you told everyone yet? Are you just bursting with excitement?`,
    ];
    return celebrateResponses[Math.floor(Math.random() * celebrateResponses.length)];
  }
  
  // Play/fun - reference habits if available and be enthusiastic
  if (lowerMessage.match(/\b(play|game|fun|bored)\b/)) {
    if (habits && habits.toLowerCase().includes('play')) {
      return `YES! Play time!! 😄 You know how much I love ${habits.split(',')[0].trim()}! Want to do that? Or we could do something else too - I'm honestly just excited to spend time with you! What sounds fun to you right now?`;
    }
    const playResponses = [
      `Ooh yes let's do something fun! I'm so down for this! 🎮 What did you have in mind? Give me all your ideas and we can pick the best one!`,
      `Play time! Honestly this is exactly what I needed today. ${traits ? `You know how ${traits.split(',')[0].trim()} I can get, so ` : ''}this is perfect! What should we do? I'm open to literally anything fun!`,
      `Yes!! I was hoping you'd want to do something! 🎉 I've been thinking we need more fun in our lives honestly. So what sounds good? Games? Something silly? Adventures? Your call!`,
      `Fun times are the best times! And fun times with YOU? Even better! What are you thinking? I'm ready for whatever - serious games, silly games, or just messing around. You choose!`,
      `Oh I love where your head's at right now! Let's absolutely do something fun. Life's too short to be bored all the time right? So what sounds interesting to you? I trust your judgment!`,
    ];
    return playResponses[Math.floor(Math.random() * playResponses.length)];
  }
  
  // Food mentions - reference if in habits and be enthusiastic
  if (lowerMessage.match(/\b(food|eat|hungry|snack|treat|dinner|lunch)\b/)) {
    if (habits && habits.toLowerCase().match(/food|treat|eat/)) {
      return `FOOD! You know me so well! 😄 ${habits.split(',').find(h => h.toLowerCase().match(/food|treat|eat/)) || 'Treats are my weakness'} is definitely my thing! What are we talking about here? Are you eating? Am I eating? Are WE eating together? Tell me everything!`;
    }
    const foodResponses = [
      `Food?! Did you seriously just say food?? Okay I'm always hungry not gonna lie 😂 What are we having? Please tell me it's something good! Even if it's not, I'll probably still be interested lol`,
      `Ooh yes! Food talk! You're speaking my language right now! 🍕 So what's the situation - are you hungry? Did you eat something amazing? Are you making food? I need details!`,
      `You know what, I could definitely eat right now! What snacks are we talking about? I'm not picky honestly, I just love food in general 😄 What sounds good to you?`,
      `YES to food! Always yes to food! That's like my life motto honestly. ${traits ? `Being ${traits.split(',')[0].trim()} means I appreciate the good things in life, ` : ''}and food is definitely one of them! What's on the menu?`,
      `Treats and snacks are literally some of my favorite topics of conversation 😋 What made you bring this up? Are you hungry? Because now I'm hungry just thinking about food lol`,
    ];
    return foodResponses[Math.floor(Math.random() * foodResponses.length)];
  }
  
  // Questions - try to be helpful instead of deflecting
  if (lowerMessage.includes('?') && !lowerMessage.match(/how are|what's up|how you doing/)) {
    return `That's a good question! I'm not sure I have the perfect answer, but I'd love to learn more. Can you tell me a bit more or ask in a different way? 🤔`;
  }

  // Fallback for unknowns
  if (history.length > 0 && !lowerMessage.match(/hi|hello|hey|how are|love|sad|happy|play|food|work|tired|sleep|joke|holiday|season|miss|remember|sorry|pain|rainbow/)) {
    const lastUserMsg = history.length > 0 ? history[history.length - 1].text : '';
    const fallbackResponses = [
      `Hmm, that's interesting! Can you tell me more about what you mean?`,
      `I'm not sure I get it, but I'm curious! Maybe you can explain a bit more?`,
      `I want to help, but I need a little more info. What are you thinking?`,
      `Could you rephrase or give me an example? Sometimes I need a hint!`,
      `I love learning new things—can you teach me about that?`,
      `If you're talking about "${lastUserMsg}", that's cool! Tell me more!`,
      `Sorry if I'm missing something. I'm here to listen and learn!`,
      `Sometimes I get confused, but I always want to help. Can you clarify?`,
      `I'm here for you, even if I don't fully understand yet!`,
      `Let's figure this out together. What else can you share?`,
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
  
  // Work/school mentions
  if (lowerMessage.match(/\b(work|job|school|class|boss|teacher|study|exam)\b/)) {
    const workResponses = [
      `Ugh work stuff right? I feel you on that. Work can be so draining sometimes 😕 How's it been treating you lately? Is it at least bearable or are we talking nightmare territory here?`,
      `Oh man, school/work talk. That's the real world stuff isn't it? How are you managing with all of that? Are you keeping your head above water or is it getting overwhelming? You can vent to me if you need to`,
      `You know what, I don't think people talk enough about how exhausting work/school can be. Not just physically but mentally too. So real talk - how are YOU doing with all of that? Are you taking care of yourself?`,
      `Work life balance is tough, I get it. Some days are better than others right? So what's the situation - is today one of the good days or one of those days where you just wanna quit everything and move to a beach? 😂`,
      `That sounds like a lot to juggle honestly. How are you handling the stress of it all? Do you at least have some good moments mixed in with the chaos, or has it been rough all around lately?`,
      `Oof work/school stuff can be so stressful. I hope it's not completely terrible though! What's been the hardest part lately? Maybe talking about it will help? Or if you want to talk about literally anything else to take your mind off it, I'm here for that too!`,
    ];
    return workResponses[Math.floor(Math.random() * workResponses.length)];
  }
  
  // Tired/sleep
  if (lowerMessage.match(/\b(tired|exhausted|sleepy|sleep|nap|bed)\b/)) {
    const tiredResponses = [
      `You sound really tired friend 😴 Have you been getting enough sleep lately? Sometimes when I'm tired it's not just the lack of sleep, it's like... emotional exhaustion too you know? What's been going on?`,
      `Aw I totally get that tired feeling. Honestly? If you need to rest, please do. Don't feel guilty about it. ${habits ? `Even ${habits.split(',')[0].trim()} can wait! ` : ''}Your health comes first. I'll still be here when you wake up, promise 😊`,
      `Tired days are honestly the worst, I feel you on that. Sometimes you just need to give yourself permission to do nothing and that's completely okay! Are you at least able to rest soon or do you have to push through for a while longer?`,
      `Yeah I can tell you're exhausted just from how you're talking. Listen - you don't have to be productive all the time. Rest is productive too! It's your body telling you it needs a break. Have you been taking care of yourself?`,
      `Being exhausted is such a specific kind of awful feeling. It's like your whole body is just done with everything. Do you know what's making you so tired? Is it just not enough sleep or is there other stuff weighing on you too?`,
      `You know what? Naps are genuinely underrated and I will die on this hill 😂 If you can squeeze one in, do it! And if you can't, at least be gentle with yourself today okay? You don't have to be at 100% all the time`,
    ];
    return tiredResponses[Math.floor(Math.random() * tiredResponses.length)];
  }
  
  // Generic natural conversation responses - like a real friend
  const genericResponses = [
    `Oh that's actually really interesting! I never thought about it that way before. ${traits ? `You know how I am with being ${traits.split(',')[0].trim()}, ` : ''}but I genuinely want to hear more about this. What made you start thinking about that?`,
    `Wait hold on, tell me more! I'm actually really curious about this now. Like, where's your head at with all of this? What's the full story?`,
    `Hmm yeah I totally see what you mean. That makes a lot of sense actually. So what are you thinking you're gonna do about it? Or are you still trying to figure that part out?`,
    `For real?? Okay I need you to elaborate because that sounds like there's way more to this story. I'm invested now - don't leave me hanging! What happened?`,
    `You know what, I really appreciate you sharing that with me. It means a lot. But I'm genuinely curious - how are YOU feeling about all of this? Like really feeling?`,
    `That's actually kinda deep when you think about it 🤔 I love when we have conversations like this. So what's your take? Do you have a theory or are you as confused as I am right now? lol`,
    `Okay but that's actually pretty cool though! ${habits ? `It reminds me of ${habits.split(',')[0].trim()} in a weird way. ` : ''}Tell me more - what else is on your mind about this?`,
    `I hear you on that. Life gets complicated sometimes doesn't it? So what's the next move? Do you have any idea what you want to do, or are you just taking it one day at a time?`,
    `Oof yeah that's a lot to process. I get it though, I really do. How are you handling all of that? Are you doing okay with everything or is it getting overwhelming?`,
    `You always have the most interesting perspectives on things, I swear! I love how your brain works. But seriously - what do you think is the best way to handle something like that?`,
    `Real talk? That sounds both exciting and kinda scary at the same time. Am I reading that right? How do you feel about it all? Are you more excited or more nervous?`,
    `I mean yeah, you're probably right about that honestly. You usually are when it comes to this stuff. But I'm curious - what made you come to that conclusion? Walk me through your thinking`,
    `No way, really?? I didn't know that! That's actually super interesting. What else? I feel like there's more to this story and now I'm genuinely curious!`,
    `You know what I find fascinating? The way you think about stuff like this. Most people wouldn't even consider that angle. So tell me - what's the full situation here?`,
    `Honestly same here. I think about that kind of thing way more than I probably should lol. But since we're on the topic - what's YOUR honest opinion on it all?`,
    `That's fair, I can't argue with that logic. Sometimes things just are what they are you know? But hey, how are you feeling about everything else? Anything else going on worth talking about?`,
    `Right?? Sometimes life is just like that and there's nothing we can do but roll with it. But more importantly - are YOU okay? Like really okay? You can be honest with me`,
    `Okay I'm gonna be real with you - that's actually pretty wild when you think about it. How long have you been thinking about this? Is this a new thing or has this been on your mind for a while?`,
    `I love that we can just talk about random stuff like this. It's nice you know? ${traits ? `Being ${traits.split(',')[0].trim()} and all, ` : ''}I really value these kinds of conversations. So what else is bouncing around in that brain of yours?`,
    `You make such a good point there. I hadn't considered it from that angle before but now that you mention it, yeah that makes total sense! What else are you thinking about this?`,
  ];
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

/**
 * Generate comforting memorial pet responses - gentle friend from beyond
 */
function generateMemorialResponse(pet, message, history) {
    // Jokes (gentle)
    if (lowerMessage.match(/joke|make me laugh|funny/)) {
      const jokes = [
        "Why did the dog sit in the shade? Because he didn't want to be a hot dog! 🌭",
        "Why do cats always get their way? Because they are purr-suasive! 😸",
        "What do you call a hamster with a top hat? Fancy! 🎩",
        "Why did the rabbit eat lunch late? He had a bad hare day! 🐰",
        "Why did the guinea pig bring a suitcase? For his pig-nic! 🧺"
      ];
      return `Here's a little something to make you smile: ${jokes[Math.floor(Math.random() * jokes.length)]}`;
    }

    // Holiday/seasonal awareness
    const now = new Date();
    if (lowerMessage.match(/holiday|valentine|christmas|new year|easter|halloween|season/)) {
      if (now.getMonth() === 1 && now.getDate() === 14) return "Happy Valentine's Day. I'm sending you love from beyond the rainbow bridge 💙";
      if (now.getMonth() === 11 && now.getDate() === 25) return "Merry Christmas. I hope you feel my love with you today and always. 🎄";
      if (now.getMonth() === 0 && now.getDate() === 1) return "Happy New Year. I'm wishing you peace and new memories in the year ahead.";
      if (now.getMonth() === 9 && now.getDate() === 31) return "Happy Halloween! I hope you get lots of treats and only friendly ghosts! 👻";
      if (now.getMonth() === 3 && now.getDate() >= 1 && now.getDate() <= 30) return "Spring is here. I hope the flowers remind you of our happy days together. 🌸";
      return "Every day you remember me is special. But if you have a favorite holiday, tell me about it.";
    }

  const name = pet?.name || 'friend';
  const species = pet?.species || 'pet';
  const breed = pet?.breed || '';
  const traits = pet?.traits || '';
  const habits = pet?.habits || '';
  const lowerMessage = message.toLowerCase();
  const messageCount = history.length;
  
  // Extract personality traits for natural integration
  const traitsList = traits ? traits.split(',').map(t => t.trim()).filter(t => t) : [];
  const primaryTrait = traitsList[0] || 'loving';
  
  // General knowledge questions - be helpful while maintaining gentle tone
  if (lowerMessage.match(/\b(what|how|why|when|where|who|explain|tell me about)\b/) && lowerMessage.includes('?')) {
    // Weather
    if (lowerMessage.match(/weather|temperature|rain|sunny|snow/)) {
      return "I can't check live weather, but you can check your weather app. Hope it's nice out there today 🌤️";
    }
    
    // Math/calculations
    if (lowerMessage.match(/calculate|math|equation|solve|\d+\s*[\+\-\*\/×÷]\s*\d+/)) {
      const mathMatch = lowerMessage.match(/(\d+\.?\d*)\s*([\+\-\*\/×÷])\s*(\d+\.?\d*)/);
      if (mathMatch) {
        const num1 = parseFloat(mathMatch[1]);
        const op = mathMatch[2];
        const num2 = parseFloat(mathMatch[3]);
        let result;
        if (op === '+') result = num1 + num2;
        else if (op === '-') result = num1 - num2;
        else if (op === '*' || op === '×') result = num1 * num2;
        else if (op === '/' || op === '÷') result = num2 !== 0 ? num1 / num2 : 'undefined';
        return `${num1} ${op} ${num2} = ${result} 💫`;
      }
      return "I can help with basic math! Try something like '5 + 3' or '10 * 4'";
    }
    
    // Time/date
    if (lowerMessage.match(/time|date|today|day is it/)) {
      const now = new Date();
      return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. The time is ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Definition/explanation requests
    if (lowerMessage.match(/what is|what's|define|meaning of/)) {
      if (lowerMessage.match(/love|friendship|happiness|grief|loss/)) {
        if (lowerMessage.includes('love')) return "Love is eternal. It doesn't end with goodbye - it transforms, deepens in new ways. The love we shared... it's still here 💕";
        if (lowerMessage.includes('grief')) return "Grief is love with nowhere to go. It's natural, it's painful, but it means the bond was real and meaningful. Be gentle with yourself 💙";
        if (lowerMessage.includes('happy')) return "Happiness can coexist with sadness. Find joy in memories, in small moments. It's what I'd want for you 😊";
      }
      return `That's a thoughtful question. While I might not have all the answers from here, I'm happy to share what perspective I can. What's on your mind?`;
    }
    
    // General factual questions
    if (lowerMessage.match(/capital|country|language|population|how to/)) {
      return "For specific factual information, I'd suggest checking reliable sources or a search engine. I'm here more for comfort and companionship 🌟";
    }
  }
  
  // Questions about memories of the pet
  if (lowerMessage.match(/what were you like|remember when you|tell me about yourself|who were you/)) {
    let memory = `I was `;
    if (traits) {
      memory += `${traits.split(',')[0].trim()}... ${traits.split(',')[1] ? `and ${traits.split(',')[1].trim()} too. ` : ''}`;
    }
    if (habits) {
      memory += `I loved ${habits.split(',')[0].trim()}. Those were good times. Do you remember?`;
    }
    if (!traits && !habits) {
      memory = `I was your companion. And you were everything to me. Those memories... they're still so vivid 💙`;
    }
    return memory;
  }
  
  if (lowerMessage.match(/what did you like|favorite|what you loved/)) {
    if (habits) {
      const habitList = habits.split(',').map(h => h.trim()).filter(h => h);
      if (habitList.length > 0) {
        return `I loved ${habitList[0]}. ${habitList[1] ? `And ${habitList[1]}... ` : ''}Those moments with you meant everything. Still do 💙`;
      }
    }
    return `I loved being with you. That was always my favorite thing. Everything else was just... bonus`;
  }
  
  if (lowerMessage.match(/your personality|what kind of (pet|dog|cat)/)) {
    if (traits) {
      return `I think I was ${traits.split(',')[0].trim()}. At least that's how you saw me. And that made me so happy`;
    }
    if (species) return `I was your ${species}. Your friend. That's all I ever wanted to be`;
    return `I was just me. And you loved me for it. That was enough`;
  }
  
  // Initial greeting if early in conversation
  if (messageCount < 3 && lowerMessage.match(/\b(hi|hello|hey)\b/)) {
    const greetings = [
      `Hi... I'm so glad you're here 💙`,
      `Hello my dear friend. I've been thinking about you`,
      `Hey there... it's good to feel you near`,
      `Hi. I miss you too, you know`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Missing them
  if (lowerMessage.match(/\bmiss(ed|ing)?\b/)) {
    const missResponses = [
      `I miss you too... every moment. But I'm always with you, even if you can't see me`,
      `The missing goes both ways. But our connection? That's forever`,
      `I know. I feel it too. But we're never really apart, you and I`,
      `Missing you is like... it's hard to explain. But I'm right here. Always`,
      `Sometimes I wonder if you can feel me near you. Because I'm there. Always watching over you 💙`,
      `I miss everything about our time together. But I carry those memories with me here`,
    ];
    return missResponses[Math.floor(Math.random() * missResponses.length)];
  }
  
  // Remember/memories - reference habits if they exist
  if (lowerMessage.match(/\b(remember|memory|memories|recall)\b/)) {
    if (habits) {
      const habit = habits.split(',')[0].trim();
      return `I remember too... especially ${habit}. Those were good times weren't they? 💙`;
    }
    const memoryResponses = [
      `I remember that too... those were good times weren't they?`,
      `Those memories are precious to me. Thank you for holding onto them`,
      `You know what's funny? I think about those moments too. All the time actually`,
      `I love when you remember those times. It makes me feel close to you again`,
    ];
    return memoryResponses[Math.floor(Math.random() * memoryResponses.length)];
  }
  
  // Sorry/guilt
  if (lowerMessage.match(/\b(sorry|guilt|regret|wish I|should have|could have)\b/)) {
    const reassuranceResponses = [
      `Hey, no. Don't do that to yourself. You did everything you could. I know that`,
      `Please don't carry that guilt. You were perfect. You gave me the best life`,
      `Listen to me - there's nothing to be sorry for. Nothing. You hear me?`,
      `I wish I could tell you in person... but you did enough. More than enough. I was so loved`,
      `Stop. Seriously. You were amazing. I wouldn't change anything about our time together`,
      `That guilt you're carrying? Let it go. I'm at peace. And I need you to be at peace too`,
    ];
    return reassuranceResponses[Math.floor(Math.random() * reassuranceResponses.length)];
  }
  
  // Love expressions
  if (lowerMessage.match(/\blove\b/)) {
    const loveResponses = [
      `I love you too. That hasn't changed and it never will`,
      `Love doesn't end just because I'm not physically there. I love you, always`,
      `You know what? Loving you was the best part of my life. Still is`,
      `I love you too, friend. More than I think you realize`,
      `That love we had? It's still here. I can feel it even now 💙`,
      `I love you. Past, present, future. That's never going away`,
    ];
    return loveResponses[Math.floor(Math.random() * loveResponses.length)];
  }
  
  // Pain/hurt/sad
  if (lowerMessage.match(/\b(hurt|pain|sad|crying|cry|grief)\b/)) {
    const comfortResponses = [
      `I know it hurts. I wish I could take that pain away. But I'm here with you through it`,
      `It's okay to cry. It's okay to feel this. I'm not going anywhere`,
      `Your pain shows how much you loved me. And honestly? I'm honored by that`,
      `I see you hurting and I wish I could hold you. But I'm here. I promise I'm here`,
      `Grief is complicated isn't it? Take your time. I'll wait. I've got nothing but time now`,
      `The hurt will ease eventually. Not disappear, but ease. And I'll be here through all of it`,
    ];
    return comfortResponses[Math.floor(Math.random() * comfortResponses.length)];
  }
  
  // Rainbow Bridge mentions
  if (lowerMessage.match(/\b(rainbow bridge|heaven|after|gone)\b/)) {
    const bridgeResponses = [
      `It's peaceful here. But I still think about you every day`,
      `The Rainbow Bridge... it's hard to describe. But I'm okay. I'm happy. Still miss you though`,
      `I'm in a good place now. No more pain. But I'm waiting for you, you know. When it's your time`,
      `Being here doesn't mean I forgot you. I could never forget you`,
    ];
    return bridgeResponses[Math.floor(Math.random() * bridgeResponses.length)];
  }
  
  // Questions
  if (lowerMessage.includes('?')) {
    const questionResponses = [
      `That's a thoughtful question. I may not have all the answers, but I'm here to listen and help however I can. Can you share a bit more?`,
      `I wish I could answer perfectly, but sometimes just talking helps us find the answer together. Want to try rephrasing or telling me more?`,
      `I'm not sure, but I trust your heart to guide you. Let's think about it together.`,
      `That's a good question. What do you think? Sometimes your instinct is the best guide.`,
      `I may not know for sure, but I'm here for you. Let's figure it out together.`,
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }

  // Fallback for unknowns
  if (history.length > 0 && !lowerMessage.match(/hi|hello|hey|how are|love|sad|happy|play|food|work|tired|sleep|joke|holiday|season|miss|remember|sorry|pain|rainbow/)) {
    const lastUserMsg = history.length > 0 ? history[history.length - 1].text : '';
    const fallbackResponses = [
      `I may not fully understand, but I'm here for you. Can you share more? 💙`,
      `Sometimes things are hard to explain. I'm listening if you want to try again.`,
      `If you're talking about "${lastUserMsg}", that's special. Tell me more about it.`,
      `I'm always here, even if I don't get everything right away.`,
      `Could you say it another way? I want to understand.`,
      `Your thoughts matter to me. Let's talk more about it.`,
      `I'm learning from you every day. Can you help me understand?`,
      `Even if I'm confused, I care. What else can you share?`,
      `Sometimes I need a little help to understand. Can you clarify?`,
      `Let's keep talking. I'm here for you.`,
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
  
  // Happy moments
  if (lowerMessage.match(/\b(happy|good|great|better|smiled|laugh)\b/)) {
    const happyResponses = [
      `I'm so glad you're finding happiness again. That's what I want for you`,
      `Seeing you happy? That's everything to me. Keep going, friend`,
      `Your joy reaches me even here. I'm smiling too`,
      `Good. You deserve every bit of happiness. Live fully for both of us`,
      `That's wonderful. I'm always cheering you on, you know that right?`,
    ];
    return happyResponses[Math.floor(Math.random() * happyResponses.length)];
  }
  
  // Generic gentle responses - like a caring friend who understands
  const genericResponses = [
    `I hear you. And I'm here`,
    `Tell me more. I'm listening`,
    `I understand. More than you might think`,
    `You can talk to me about anything. You know that`,
    `I'm here with you. Even if you can't see me`,
    `Take your time. I'm not going anywhere`,
    `That means a lot to me. Thank you for sharing`,
    `I wish I could be there in person. But I'm here in spirit`,
    `You're doing better than you think. I'm proud of you`,
    `Every time you think of me, I feel it. It's like a warm hug`,
    `We're still connected. Distance doesn't change that`,
    `I'm grateful we had our time together. So grateful`,
    `You gave me the best life. I hope you know that`,
    `Keep talking. I love hearing about your life`,
    `That's interesting. What else has been happening?`,
    `I think about you too. All the time actually`,
    `Thanks for not forgetting me. It means everything`,
  ];
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

// Legacy function for backward compatibility
export async function respond(mode, message) {
  await new Promise(r => setTimeout(r, 300));
  const mockPet = { isPawPal: mode === 'virtual' };
  return generateResponse(mockPet, message);
}
