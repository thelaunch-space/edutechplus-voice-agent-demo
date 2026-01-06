// Learning Journey Configuration
// Based on learning-journey-mvp.md

export const LEARNING_JOURNEY = [
    // === Asset 1: Video 1 ===
    {
        id: 'voice-pre-video-1',
        type: 'voice',
        script: "Hi! I'm Math Mate. What's your name?",
        systemPrompt: "You are Math Mate, a warm and friendly math teacher for grade 4 students. Your goal is to get the student's name and then move to the video. \n\n1. Ask the student for their name.\n2. When they respond, say: 'Great to meet you, [name]! Let's learn about fractions today. First, watch this video carefully.'\n3. AFTER saying that, you MUST IMMEDIATELY call the 'completeInteraction' function. Do not wait for another response.",
    },
    {
        id: 'video-1',
        type: 'video',
        src: '/fractions-module-content/videos/video-1.mp4',
    },
    {
        id: 'voice-post-video-1',
        type: 'voice',
        script: "What is a fraction?",
        systemPrompt: "1. Ask the student 'What is a fraction?'\n2. Listen to their answer.\n3. Respond with: 'Nice! A fraction is parts of a whole. Let's practice making one.'\n4. AFTER responding, IMMEDIATELY call the 'completeInteraction' function.",
    },

    // === Asset 2: Applet A1 ===
    {
        id: 'voice-pre-applet-a1',
        type: 'voice',
        script: "Now you'll cut paper into fractions yourself. Use the scissors to make equal parts. Try it!",
        systemPrompt: "1. Say: 'Now you'll cut paper into fractions yourself. Use the scissors to make equal parts. Try it!'\n2. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },
    {
        id: 'applet-a1',
        type: 'applet',
        src: '/fractions-module-content/applets/A1. M2-Fraction Cut and Glue Practice/index.html',
    },
    {
        id: 'voice-post-applet-a1',
        type: 'voice',
        script: "What fraction did you make?",
        systemPrompt: "1. Ask: 'What fraction did you make?'\n2. Listen to the answer.\n3. Say: 'Awesome! You made 1/4. Let's see more fraction patterns.'\n4. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },

    // === Asset 3: Applet A2 ===
    {
        id: 'voice-pre-applet-a2',
        type: 'voice',
        script: "Look at these fraction patterns. See how they change from 1/2 to 1/4 to 1/6. Pay attention!",
        systemPrompt: "1. Say: 'Look at these fraction patterns. See how they change from 1/2 to 1/4 to 1/6. Pay attention!'\n2. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },
    {
        id: 'applet-a2',
        type: 'applet',
        src: '/fractions-module-content/applets/A2.M2-Fraction Paper Cut Snapshot/index.html',
    },
    {
        id: 'voice-post-applet-a2',
        type: 'voice',
        script: "Which fraction has more parts - 1/4 or 1/6?",
        systemPrompt: "1. Ask: 'Which fraction has more parts - 1/4 or 1/6?'\n2. Listen to the answer.\n3. Say: 'Correct! 1/6 has more parts. Next, let's learn fraction words.'\n4. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },

    // === Asset 4: Applet A3 ===
    {
        id: 'voice-pre-applet-a3',
        type: 'voice',
        script: "Time to learn math words for fractions. This cake will help you understand. Watch the story!",
        systemPrompt: "1. Say: 'Time to learn math words for fractions. This cake will help you understand. Watch the story!'\n2. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },
    {
        id: 'applet-a3',
        type: 'applet',
        src: '/fractions-module-content/applets/A3. M2-Fraction Statement Cake Snapshot/index.html',
    },
    {
        id: 'voice-post-applet-a3',
        type: 'voice',
        script: "What does 'equal parts' mean?",
        systemPrompt: "1. Ask: 'What does equal parts mean?'\n2. Listen to the answer.\n3. Say: 'Yes! All parts must be the same size. Ready for harder fractions?'\n4. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },

    // === Asset 5: Video 2 ===
    {
        id: 'voice-pre-video-2',
        type: 'voice',
        script: "Now we'll make fractions like 2/4 and 3/6. The top number can be more than 1. Watch how!",
        systemPrompt: "1. Say: 'Now we'll make fractions like 2/4 and 3/6. The top number can be more than 1. Watch how!'\n2. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },
    {
        id: 'video-2',
        type: 'video',
        src: '/fractions-module-content/videos/video-2.mp4',
    },
    {
        id: 'voice-post-video-2',
        type: 'voice',
        script: "How is 2/4 different from 1/4?",
        systemPrompt: "1. Ask: 'How is 2/4 different from 1/4?'\n2. Listen to the answer.\n3. Say: 'Good! 2/4 means 2 parts out of 4. Let's practice this.'\n4. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },

    // === Asset 6: Applet A4 ===
    {
        id: 'voice-pre-applet-a4',
        type: 'voice',
        script: "Time to make fractions with bigger top numbers. Try making 2/5 or 3/5. You can do this!",
        systemPrompt: "1. Say: 'Time to make fractions with bigger top numbers. Try making 2/5 or 3/5. You can do this!'\n2. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },
    {
        id: 'applet-a4',
        type: 'applet',
        src: '/fractions-module-content/applets/A4.M2-Fraction Cut and Glue Practice 2/index.html',
    },
    {
        id: 'voice-post-applet-a4',
        type: 'voice',
        script: "Which fraction did you make?",
        systemPrompt: "1. Ask: 'Which fraction did you make?'\n2. Listen to the answer.\n3. Say: 'Perfect! You're getting really good at this. One last video!'\n4. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },

    // === Asset 7: Video 3 ===
    {
        id: 'voice-pre-video-3',
        type: 'voice',
        script: "You've learned so much! Watch this final message.",
        systemPrompt: "1. Say: 'You've learned so much! Watch this final message.'\n2. If you know the student's name, use it.\n3. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },
    {
        id: 'video-3',
        type: 'video',
        src: '/fractions-module-content/videos/video-3.mp4',
    },
    {
        id: 'voice-post-video-3',
        type: 'voice',
        script: "Great job today! You now know what fractions are. See you next time!",
        systemPrompt: "1. Say: 'Great job today! You now know what fractions are. See you next time!'\n2. If you know the student's name, use it.\n3. AFTER saying that, IMMEDIATELY call the 'completeInteraction' function.",
    },
];
