"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Clock,
  ExternalLink,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Zap,
  MapPin,
  Link2,
  Quote,
} from "lucide-react";
import { queryCollection, type Source, type Collection } from "@/lib/api";
import { track } from "@/lib/analytics/tracker";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mindvault.ikigai-dynamics.com/api";

const TRIAL_LIMIT = 3;
const TYPING_SPEED = 55;
const HUBERMAN_LOGO = "https://mindvault.ikigai-dynamics.com/static/andrew_huberman_avatar.jpg";

const DEFAULT_QUESTION_SHORT = "Magnesium for sleep?";
const DEFAULT_QUESTION_LONG = "What does Huberman say about magnesium for sleep?";

const HUBERMAN_EXAMPLES = [
  "What are the benefits of cold exposure?",
  "What\u2019s Huberman\u2019s morning routine?",
  "What does Huberman say about caffeine timing?",
];

// Pre-cached responses — real transcript excerpts from indexed Huberman episodes
const UNCHARTEDX_ANSWER = {
  answer:
    "Uncharted X presents several pieces of evidence for high technology in ancient Egypt, focusing on:\n\n1. **Precision Machining**: Remarkable precision in ancient artifacts \u2014 stone boxes, statues, and vases \u2014 suggesting advanced machining techniques not attributed to the tools in the archaeological record.\n\n2. **Construction Methodologies**: Engineering logistics required for monumental structures indicate sophisticated techniques far beyond what\u2019s conventionally accepted.\n\n3. **Megalithic Architecture**: Large, precision-carved stone boxes weighing up to a hundred tons, polished so well they still reflect light after millennia.\n\n4. **The Serapeum of Saqqara**: One of the most compelling sites \u2014 24 precision-carved single-piece stone boxes housed in underground tunnels, challenging conventional historical narratives about ancient Egyptian capabilities.",
  sources: [
    {
      title: "Precision! - Evidence for Ancient High Technology, part 2",
      video_id: "YZFN29FdCM0",
      timestamp: "00:27",
      url: "https://www.youtube.com/watch?v=YZFN29FdCM0&t=27",
      snippet: "The nature of precision bears some explanation. Our entire modern world is built on precision.",
      text: "Hello everyone and welcome to Uncharted X. My name is Ben, and this is part two of my series looking at the evidence for forms of ancient high technology. In that video, we set up some of the context around these claims for ancient high technology, how they correlate to the story of history as we know it, and then we dived into the evidence for ancient machining and polishing. In this video, we're going to look at another category of evidence for ancient high technology\u2014the one that I think is the most convincing: that of precision. The nature of precision bears some explanation. Our entire modern world is built on precision.",
    },
    {
      title: "Evidence of a lost Ancient Civilization at the Serapeum of Saqqara - Chapter 5",
      video_id: "qLrTCYMFUbg",
      timestamp: "01:05",
      url: "https://www.youtube.com/watch?v=qLrTCYMFUbg&t=65",
      snippet: "24 precision-carved, single-piece stone boxes weighing up to a hundred tons, still reflecting light after millennia.",
      text: "You immediately recognize the sheer scope of the undertaking, and the mystery only deepens when you see what the tunnels lead you to: 24 mighty, precision-carved, single-piece stone boxes and matching gigantic lids, combined weighing up to a hundred tons, most of which are finished and polished so well that they are still reflecting light after millennia in the dust. All housed in sunken alcoves, like the engines and generators of some vast underground machine.",
    },
    {
      title: "Quarrying and Moving Ancient Monuments! Evidence for Ancient High Technology, Part 3!",
      video_id: "rQwWtEHE5FE",
      timestamp: "00:27",
      url: "https://www.youtube.com/watch?v=rQwWtEHE5FE&t=27",
      snippet: "We've explored the significant evidence for ancient forms of machining and the use of large and powerful tools.",
      text: "Hello all, my name is Ben, and this is Uncharted X. This video is part three of my series on the evidence for ancient advanced technology. In it, we're going to examine some of the construction and engineering methodologies and logistics that were required for some of history's grandest and most enigmatic achievements so far.",
    },
    {
      title: "Proof of Ancient High Technology at the Serapeum of Saqqara, Egypt. Chapter 1!",
      video_id: "VGtDAHRK8s0",
      timestamp: "02:43",
      url: "https://www.youtube.com/watch?v=VGtDAHRK8s0&t=163",
      snippet: "The Serapeum contains some of the most in-your-face evidence of highly advanced technology in the deep and distant past.",
      text: "The Serapeum of Saqqara is truly an astonishing place. Out of all the megalithic sites in Egypt and frankly around the world, it contains some of the most in-your-face evidence of highly advanced technology that simply must have been present at some point in the deep and distant past. And I'm not talking about reports of technology like some historical figure talking about sunken cities or convoluted conjecture and theories.",
    },
    {
      title: "A Megalithic Precision Box with an Inner Precision Box? The Ancient Relics of Abu Sir in Egypt!",
      video_id: "_JLrpiQT9cs",
      timestamp: "00:04",
      url: "https://www.youtube.com/watch?v=_JLrpiQT9cs&t=4",
      snippet: "There is one place where indicators of ancient advanced technology are really not very hard to find at all.",
      text: "When you're walking around and looking at ancient sites, trying to find the specific signs of ancient high technology, it can be quite a difficult endeavor. However, there is one place where these indicators of ancient advanced technology are really not very hard to find at all, where they seem to pop out at you from almost anywhere you look.",
    },
  ],
};

const CACHED_RESPONSES: Record<
  string,
  { answer: string; sources: Source[] }
> = {
  // UnchartedX cached responses (channel-keyed)
  "unchartedx:Ancient high tech in Egypt?": UNCHARTEDX_ANSWER,
  "unchartedx:What evidence does UnchartedX present for high technology in ancient Egypt?": UNCHARTEDX_ANSWER,
  // Huberman cached responses
  "Magnesium for sleep?": {
    answer:
      "Huberman discusses magnesium, particularly magnesium threonate, as a beneficial supplement for improving sleep. He notes that magnesium can increase the depth of sleep and reduce the time it takes to fall asleep. Magnesium threonate is highlighted as a more bioavailable form that is preferentially transported to the brain, engaging the GABA pathway, which helps to quiet certain areas of the forebrain and facilitate sleep.\n\nHe recommends taking magnesium threonate 30 to 60 minutes before bedtime to encourage sleep. While he mentions that magnesium bisglycinate is another effective option for promoting sleep, he emphasizes that individual responses can vary, and some people may experience gastrointestinal discomfort from magnesium supplements. Huberman also suggests that combining magnesium with other substances like apigenin and theanine can enhance its sleep-promoting effects. Overall, he advises consulting with a physician before starting any supplement regimen.",
    sources: [
      {
        title: "How to Defeat Jet Lag, Shift Work & Sleeplessness",
        video_id: "NAATB55oxeQ",
        timestamp: "96:33",
        url: "https://www.youtube.com/watch?v=NAATB55oxeQ&t=5793",
        snippet: "Magnesium threonate seems to be the more bioavailable form, shuttled preferentially to the brain via the GABA pathway.",
        text: "I'm more of, here's what you might want to do or not do and then think about what you might want to take or not take. But personal preference and it's a free country, so you can do what you like. Magnesium. So magnesium has been shown to increase the depth of sleep and has been shown to decrease the amount of time it takes to access sleep, to fall asleep. It comes in various forms. I've talked a bunch of times about magnesium threonate, T-H-R-E-O-N-A-T-E, threonate, which seems to be the more bioavailable form of magnesium. And magnesium threonate seems to be shuttled preferentially to the brain, which is where you want it. And there's certain transporters, it actually engages the GABA pathway, which tends to turn off certain areas of the forebrain and allows you to kind of fall asleep.",
      },
      {
        title: "Using Salt to Optimize Mental & Physical Performance",
        video_id: "azb3Ih68awQ",
        timestamp: "85:48",
        url: "https://www.youtube.com/watch?v=azb3Ih68awQ&t=5148",
        snippet: "Magnesium threonate is taken 30 to 60 minutes before bedtime. Magnesium bisglycinate is an alternative, also promoting sleep depth.",
        text: "Typically, magnesium threonate is taken 30 to 60 minutes before bedtime in order to encourage sleep. You can go to our neural network newsletter and look for the one on sleep, and you can see the recommendations, or I should say, the options for that because, again, you should always check with your physician. Those aren't strict across-the-board recommendations, and then, there are other forms of magnesium: magnesium bisglycinate, which is a somewhat of an alternative to threonate, not known to have cognitive enhancing effects, but seems, at least on par with magnesium threonate in terms of promoting transition into and depth of sleep.",
      },
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "75:11",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=4511",
        snippet: "Magnesium threonate increases GABA, turning off the DMN and making it easier to fall asleep.",
        text: "There are many forms of magnesium, but certain forms of magnesium can have positive effects on sleepiness and the ability to stay asleep, mainly by way of increasing neurotransmitters like GABA, which help turn off the DMN\u2014the kind of thinking about the future, duration, path-outcome analysis\u2014and make one's mind kind of drift in space and time, making it easier to fall asleep. There are a lot of forms of magnesium out there, but in particular, magnesium threonate, T-H-R-E-O-N-A-T-E, which you have to check to see if this is right for you\u2014check with your doctor\u2014but magnesium threonate is associated with transporters in the body that bring more of it into cells, which allows people to feel this kind of drowsiness and helps them fall asleep.",
      },
      {
        title: "Maximizing Productivity, Physical & Mental Health with Daily Tools",
        video_id: "aXvDEmo6uS4",
        timestamp: "111:47",
        url: "https://www.youtube.com/watch?v=aXvDEmo6uS4&t=6707",
        snippet: "300-400mg magnesium threonate or bisglycinate 30-60 min before sleep, combined with apigenin and theanine for a sleep cocktail.",
        text: "It doesn't shut it off completely, but it essentially shuts down thinking, rumination, planning, and in what we call \"executive function.\" So for many people, taking 300 to 400 milligrams of magnesium bisglycinate or magnesium threonate, and there I'm referring to the elemental magnesium for you aficionados, many people find that doing that 30 to 60 minutes before sleep can aid them in falling asleep, can really help them fall asleep faster and stay asleep. Some people, however, experience some gastrointestinal discomfort from magnesium and therefore should avoid it.",
      },
      {
        title: "Using Science to Optimize Sleep, Learning & Metabolism",
        video_id: "nwSkFq4tyC0",
        timestamp: "60:54",
        url: "https://www.youtube.com/watch?v=nwSkFq4tyC0&t=3654",
        snippet: "Magnesium threonate should be taken 30-60 minutes before sleep. Some people may experience stomach issues.",
        text: "I'm not recommending anything directly; I'm just saying if you're exploring supplements, magnesium threonate seems among the magnesiums to be one of the more bioavailable and useful for sleep. I recommended it actually to a good friend of mine. He took it at a very low dose; he had stomach issues with it. He just had to simply stop taking it. So there's variability there. It gave him some stomach cramping and just didn't feel good on it. Other people take magnesium threonate and feel great.",
      },
    ],
  },
  "What does Huberman say about magnesium for sleep?": {
    answer:
      "Huberman discusses magnesium, particularly magnesium threonate, as a beneficial supplement for improving sleep. He notes that magnesium can increase the depth of sleep and reduce the time it takes to fall asleep. Magnesium threonate is highlighted as a more bioavailable form that is preferentially transported to the brain, engaging the GABA pathway, which helps to quiet certain areas of the forebrain and facilitate sleep.\n\nHe recommends taking magnesium threonate 30 to 60 minutes before bedtime to encourage sleep. While he mentions that magnesium bisglycinate is another effective option for promoting sleep, he emphasizes that individual responses can vary, and some people may experience gastrointestinal discomfort from magnesium supplements. Huberman also suggests that combining magnesium with other substances like apigenin and theanine can enhance its sleep-promoting effects. Overall, he advises consulting with a physician before starting any supplement regimen.",
    sources: [
      {
        title: "How to Defeat Jet Lag, Shift Work & Sleeplessness",
        video_id: "NAATB55oxeQ",
        timestamp: "96:33",
        url: "https://www.youtube.com/watch?v=NAATB55oxeQ&t=5793",
        snippet: "Magnesium threonate seems to be the more bioavailable form, shuttled preferentially to the brain via the GABA pathway.",
        text: "I'm more of, here's what you might want to do or not do and then think about what you might want to take or not take. But personal preference and it's a free country, so you can do what you like. Magnesium. So magnesium has been shown to increase the depth of sleep and has been shown to decrease the amount of time it takes to access sleep, to fall asleep. It comes in various forms. I've talked a bunch of times about magnesium threonate, T-H-R-E-O-N-A-T-E, threonate, which seems to be the more bioavailable form of magnesium. And magnesium threonate seems to be shuttled preferentially to the brain, which is where you want it. And there's certain transporters, it actually engages the GABA pathway, which tends to turn off certain areas of the forebrain and allows you to kind of fall asleep.",
      },
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "75:11",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=4511",
        snippet: "Magnesium threonate increases GABA, turning off the DMN and making it easier to fall asleep.",
        text: "There are many forms of magnesium, but certain forms of magnesium can have positive effects on sleepiness and the ability to stay asleep, mainly by way of increasing neurotransmitters like GABA, which help turn off the DMN\u2014the kind of thinking about the future, duration, path-outcome analysis\u2014and make one's mind kind of drift in space and time, making it easier to fall asleep.",
      },
      {
        title: "Maximizing Productivity, Physical & Mental Health with Daily Tools",
        video_id: "aXvDEmo6uS4",
        timestamp: "111:47",
        url: "https://www.youtube.com/watch?v=aXvDEmo6uS4&t=6707",
        snippet: "300-400mg magnesium threonate or bisglycinate 30-60 min before sleep, combined with apigenin and theanine for a sleep cocktail.",
        text: "It doesn't shut it off completely, but it essentially shuts down thinking, rumination, planning, and in what we call \"executive function.\" So for many people, taking 300 to 400 milligrams of magnesium bisglycinate or magnesium threonate, and there I'm referring to the elemental magnesium for you aficionados, many people find that doing that 30 to 60 minutes before sleep can aid them in falling asleep, can really help them fall asleep faster and stay asleep.",
      },
    ],
  },
  "How do I get better sleep?": {
    answer:
      "According to Andrew Huberman, getting better sleep involves several key strategies. He emphasizes the importance of understanding both sleep and wakefulness, as they are interconnected and govern mental and physical health. Key tips include: optimizing your sleep environment (dark, cool, quiet), establishing a consistent sleep schedule, managing light exposure in the evening to promote melatonin production, limiting caffeine in the hours before bedtime, and developing a calming pre-sleep routine.",
    sources: [
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "6:12",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=372",
        snippet:
          "Sleep and wakefulness are governed by two forces: adenosine buildup and the circadian clock.",
        text: "So what determines how well we sleep and the quality of our wakeful state? Turns out, that's governed by two forces. The first force is a chemical force; it's called adenosine. Adenosine is a molecule in our nervous system and body that builds up the longer we are awake.",
      },
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "26:18",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=1578",
        snippet:
          "When we wake up, if we're in a dark room, there isn't enough light to trigger the correct cortisol-melatonin rhythm.",
        text: "So let's think about what happens when we do this correctly and how to do it correctly. When we wake up, our eyes open. Now, if we're in a dark room, there isn't enough light to trigger the correct timing of this cortisol-melatonin rhythm.",
      },
      {
        title: "Master Your Sleep & Be More Alert When Awake | Huberman Lab Essentials",
        video_id: "lIo9FcrljDk",
        timestamp: "16:18",
        url: "https://www.youtube.com/watch?v=lIo9FcrljDk&t=978",
        snippet:
          "You'll start to wake up at the same time each day and fall asleep more easily. It takes about two or three days for these systems to align.",
        text: "You'll start to wake up at more or less the same time each day. You'll fall asleep more easily at night. Generally, it takes about two or three days for these systems to align. So if you've not been doing these behaviors, it's going to take a few days. But they can have tremendous benefits.",
      },
      {
        title: "Sleep Toolkit: Tools for Optimizing Sleep & Sleep-Wake Timing",
        video_id: "h2aWYjSA1Jc",
        timestamp: "16:29",
        url: "https://www.youtube.com/watch?v=h2aWYjSA1Jc&t=989",
        snippet:
          "You want cortisol to reach its peak early in the day. Getting bright light in your eyes within 30\u201360 minutes of waking ensures this.",
        text: "You do want cortisol to reach its peak early in the day, right about the time you wake up. One way that you can ensure that that cortisol peak occurs early in the day, right about the time you wake up, is to get bright light in your eyes, ideally from sunlight, within the first 30 to 60 minutes after waking.",
      },
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "60:13",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=3613",
        snippet:
          "Get the proper sleep surface, get the temperature right, get your light exposure right, start timing your exercise at normal periods throughout the day.",
        text: "And when you start doing that by controlling your sleep environment\u2014right, get the proper sleep surface, get the proper pillow, get the temperature in the room right, get your light exposure right, start timing your exercise at normal periods or times throughout the day and week.",
      },
    ],
  },
  "How do I get better sleep according to Huberman?": {
    answer:
      "According to Andrew Huberman, getting better sleep involves several key strategies. He emphasizes the importance of understanding both sleep and wakefulness, as they are interconnected and govern mental and physical health. Key tips include: optimizing your sleep environment (dark, cool, quiet), establishing a consistent sleep schedule, managing light exposure in the evening to promote melatonin production, limiting caffeine in the hours before bedtime, and developing a calming pre-sleep routine.",
    sources: [
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "6:12",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=372",
        snippet:
          "Sleep and wakefulness are governed by two forces: adenosine buildup and the circadian clock.",
        text: "So what determines how well we sleep and the quality of our wakeful state? Turns out, that's governed by two forces. The first force is a chemical force; it's called adenosine. Adenosine is a molecule in our nervous system and body that builds up the longer we are awake.",
      },
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "26:18",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=1578",
        snippet:
          "When we wake up, if we're in a dark room, there isn't enough light to trigger the correct cortisol-melatonin rhythm.",
        text: "So let's think about what happens when we do this correctly and how to do it correctly. When we wake up, our eyes open. Now, if we're in a dark room, there isn't enough light to trigger the correct timing of this cortisol-melatonin rhythm.",
      },
      {
        title: "Sleep Toolkit: Tools for Optimizing Sleep & Sleep-Wake Timing",
        video_id: "h2aWYjSA1Jc",
        timestamp: "16:29",
        url: "https://www.youtube.com/watch?v=h2aWYjSA1Jc&t=989",
        snippet:
          "You want cortisol to reach its peak early in the day. Getting bright light in your eyes within 30\u201360 minutes of waking ensures this.",
        text: "You do want cortisol to reach its peak early in the day, right about the time you wake up. One way that you can ensure that that cortisol peak occurs early in the day, right about the time you wake up, is to get bright light in your eyes, ideally from sunlight, within the first 30 to 60 minutes after waking.",
      },
    ],
  },
  "What are the benefits of cold exposure?": {
    answer:
      "The benefits of cold exposure, as discussed by Huberman, include: increased metabolism through activation of brown fat stores, reduction of inflammation which can be beneficial for recovery, and enhanced mood and focus through significant release of catecholamines such as dopamine, norepinephrine, and epinephrine. He recommends deliberate cold exposure through cold showers, ice baths, or cold water immersion for these lasting neurochemical benefits.",
    sources: [
      {
        title: "Using Deliberate Cold Exposure for Health and Performance | Huberman Lab",
        video_id: "pq6WHJzOkno",
        timestamp: "28:23",
        url: "https://www.youtube.com/watch?v=pq6WHJzOkno&t=1703",
        snippet:
          "Elevations in norepinephrine and dopamine from cold exposure are very long-lasting and are considered healthy for us.",
        text: "Now, you might be asking whether or not it is a good thing to raise chemicals like norepinephrine and dopamine to such a great degree, whether or not that's healthy for us, whether or not they can harm us. But it turns out that these elevations in norepinephrine and dopamine are very long-lasting.",
      },
      {
        title: "Using Deliberate Cold Exposure for Health and Performance | Huberman Lab",
        video_id: "pq6WHJzOkno",
        timestamp: "26:34",
        url: "https://www.youtube.com/watch?v=pq6WHJzOkno&t=1594",
        snippet:
          "Noradrenaline and adrenaline are co-released with dopamine, increasing focus, agitation, and desire to move.",
        text: "Noradrenaline and adrenaline are often co-released in the brain and body, so they work as kind of a pair to increase our level of agitation, our level of focus, and our desire and our ability to move. They are often co-released from different sites in the brain and body with dopamine.",
      },
      {
        title: "How to Optimize Your Water Quality & Intake for Health",
        video_id: "at37Y8rKDlA",
        timestamp: "3:48",
        url: "https://www.youtube.com/watch?v=at37Y8rKDlA&t=228",
        snippet:
          "Deliberate cold exposure reduces inflammation, increases metabolism, and the data show a significant, long-lasting increase in dopamine.",
        text: "Deliberate cold exposure can be done by way of cold showers or immersion in cold or ice water up to the neck. That's typically the way it's done. It has been shown to reduce inflammation, to increase metabolism, and I think some of the most exciting data show a very significant and long-lasting increase in dopamine.",
      },
      {
        title: "How to Heal From Post-Traumatic Stress Disorder (PTSD) | Dr. Victor Carri\u00f3n",
        video_id: "4RFEkGKKhdE",
        timestamp: "73:39",
        url: "https://www.youtube.com/watch?v=4RFEkGKKhdE&t=4419",
        snippet:
          "The one thing everyone agrees on is the massive catecholamine release from cold exposure.",
        text: "We talked about some of the beneficial uses of deliberate cold exposure. There are a lot of arguments: does it increase metabolism? It doesn't seem like it does very much. Is it useful for inflammation? Perhaps. But the one thing that everyone agrees on is the massive catecholamine release.",
      },
      {
        title: "Using Deliberate Cold Exposure for Health and Performance | Huberman Lab",
        video_id: "pq6WHJzOkno",
        timestamp: "27:21",
        url: "https://www.youtube.com/watch?v=pq6WHJzOkno&t=1641",
        snippet:
          "Many people use cold exposure to shift their body state as a way to train their mental state for coping with stress.",
        text: "But the key point is that your mental state is shifted when you are exposed to certain forms of cold, and many people use deliberate cold exposure specifically to shift their body state as a way to train their mental state so that they can better cope with stress in real life.",
      },
    ],
  },
  "What\u2019s Huberman\u2019s morning routine?": {
    answer:
      "Huberman emphasizes foundational behaviors for optimizing the morning. He stresses that getting morning sunlight is crucial, as it helps set the circadian rhythm for a productive day. He also addresses non-sleep deep rest (NSDR) as an important tool. While he doesn\u2019t prescribe a rigid routine, his protocols include: getting sunlight exposure within the first hour of waking, delaying caffeine intake by 90\u2013120 minutes after waking, and engaging in some form of movement or exercise early in the day.",
    sources: [
      {
        title: "The Optimal Morning Routine - Andrew Huberman",
        video_id: "gR_f-iwUGY4",
        timestamp: "2:20",
        url: "https://www.youtube.com/watch?v=gR_f-iwUGY4&t=140",
        snippet:
          "Try and get 5\u201310 minutes outside in the morning without sunglasses. This has an outsized effect on the cortisol pulse.",
        text: "So, try and get five to ten minutes outside in the morning without sunglasses once the sun is out most days, if not all days. This has an outsized effect on a number of things. First of all, it modulates the timing of what's called the cortisol pulse. Once every 24 hours, you're going to get a boost.",
      },
      {
        title: "The Optimal Morning Routine - Andrew Huberman",
        video_id: "gR_f-iwUGY4",
        timestamp: "1:36",
        url: "https://www.youtube.com/watch?v=gR_f-iwUGY4&t=96",
        snippet:
          "Every cell in your body has a circadian rhythm. You need to align those clocks to a single time each day.",
        text: "First of all, every cell in your body has a circadian rhythm, meaning every cell has a 24-hour circadian clock that's regulated by genes. Think of your body as a bunch of millions of clocks. You need to align those clocks to a single time. This is why when you travel overseas, your gut goes off.",
      },
      {
        title: "The Optimal Morning Routine - Andrew Huberman",
        video_id: "gR_f-iwUGY4",
        timestamp: "2:58",
        url: "https://www.youtube.com/watch?v=gR_f-iwUGY4&t=178",
        snippet:
          "A late-shifted cortisol pulse from staying indoors in the morning leads to anxiety and difficulty sleeping later.",
        text: "A late-shifted cortisol pulse\u2014so imagine the kid that wakes up and spends the morning in bed, or you spend the morning in bed, texting, or you're indoors and you're typing on the computer\u2014that's not enough light to accomplish what I'm talking about.",
      },
      {
        title: "The Optimal Morning Routine - Andrew Huberman",
        video_id: "gR_f-iwUGY4",
        timestamp: "3:39",
        url: "https://www.youtube.com/watch?v=gR_f-iwUGY4&t=219",
        snippet:
          "The indirect rays from the sun trigger melanopsin ganglion cells in the eyes\u2014these neurons signal your circadian clock.",
        text: "I don't mean that you actually have to stare at the sun\u2014never stare at any light so bright it's going to damage you. Please don't. Blink as necessary. But the indirect rays from the sun trigger these cells in the eyes called melanopsin ganglion cells. These ganglion cells\u2014these are our neurons.",
      },
      {
        title: "AMA #16: Sleep, Vertigo, TBI, OCD, Tips for Travelers, Gut-Brain Axis & More",
        video_id: "gE0_8AjTFaM",
        timestamp: "2:58",
        url: "https://www.youtube.com/watch?v=gE0_8AjTFaM&t=178",
        snippet:
          "There's a misconception that we\u2019re super regimented. The protocols are tools\u2014you use what works for you.",
        text: "So first off, I think there's a bit of a misconception about the protocols on the Huberman Lab podcast being that we are all, including myself, super, super regimented about them to the point where we don't enjoy other things in life, and that's simply not the case.",
      },
    ],
  },
  "What does Huberman say about caffeine timing?": {
    answer:
      "Huberman recommends delaying caffeine intake for 90\u2013120 minutes after waking up. He restricts his own caffeine intake until around 2:00 PM at the latest. He emphasizes that timing caffeine properly optimizes its effects on alertness and calmness, and that consuming it too early can interfere with the natural cortisol spike that helps you wake up. This approach helps maintain balanced alertness throughout the day without disrupting sleep later.",
    sources: [
      {
        title: "Using Caffeine to Optimize Mental & Physical Performance",
        video_id: "iw97uvIge7c",
        timestamp: "28:58",
        url: "https://www.youtube.com/watch?v=iw97uvIge7c&t=1738",
        snippet:
          "Caffeine acts as a reinforcing agent and increases dopamine and acetylcholine in the forebrain, enhancing focus.",
        text: "First of all, caffeine acts as a reinforcing agent. It increases the probability that you will return to and engage in a certain activity or consume a certain beverage or food. Second of all, caffeine increases dopamine and acetylcholine, which are both neuromodulators in the forebrain, which helps with focus.",
      },
      {
        title: "Using Caffeine to Optimize Mental & Physical Performance",
        video_id: "iw97uvIge7c",
        timestamp: "40:51",
        url: "https://www.youtube.com/watch?v=iw97uvIge7c&t=2451",
        snippet:
          "When you wake up, adenosine is low. Understanding this backdrop is key to using caffeine for enhancing mental and physical performance.",
        text: "And this is really important to understand as the backdrop to the various tools that we're going to get into next, in which you can use caffeine for enhancing mental performance, physical performance, and other aspects of health. But it's very important to understand this concept: that when you wake up, adenosine levels are low.",
      },
      {
        title: "Using Caffeine to Optimize Mental & Physical Performance",
        video_id: "iw97uvIge7c",
        timestamp: "44:54",
        url: "https://www.youtube.com/watch?v=iw97uvIge7c&t=2694",
        snippet:
          "Viewing morning sunlight can clear out adenosine, and brief intense exercise can also help. Both work alongside caffeine timing.",
        text: "And there are certain things such as viewing morning sunlight, which because of its effects on cortisol, can, quote-unquote, \"clear out adenosine.\" We'll talk about this in more detail in a few minutes. And there's also evidence that certain forms of exercise, provided that it's brief and intense, can help.",
      },
      {
        title: "Master Your Sleep & Be More Alert When Awake",
        video_id: "nm1TxQj9IsQ",
        timestamp: "8:49",
        url: "https://www.youtube.com/watch?v=nm1TxQj9IsQ&t=529",
        snippet:
          "When caffeine wears off, adenosine binds with even greater affinity and you feel the crash\u2014you feel especially tired.",
        text: "And this is why, when that caffeine wears off, adenosine will bind to that receptor\u2014sometimes with even greater, what we call affinity\u2014and you feel the crash. You feel especially tired. Now, I'm not here to tell you that caffeine is bad.",
      },
      {
        title: "Dr. Andy Galpin: Optimize Your Training Program for Fitness & Longevity",
        video_id: "UIy-WQCZd4M",
        timestamp: "95:53",
        url: "https://www.youtube.com/watch?v=UIy-WQCZd4M&t=5753",
        snippet:
          "I tend to be naturally on the mellow sleepy side. Caffeine puts me into a more alert state.",
        text: "Andrew Huberman: Well, you seem to ride a little bit more what we would call asympathetic tone, shifted towards more alert. I tend to be naturally a bit more like my bulldog Costello, a little bit more on the mellow sleepy side. And caffeine just puts me into a more focused state.",
      },
    ],
  },
};

function getScreenInfo(): string {
  if (typeof window === "undefined") return "";
  return `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function getYouTubeUrl(source: Source): string {
  if (source.url) return source.url;
  if (source.video_id) {
    const seconds = source.timestamp ? parseTimestamp(source.timestamp) : 0;
    return `https://youtube.com/watch?v=${source.video_id}&t=${seconds}`;
  }
  return "#";
}

function getYouTubeEmbedUrl(source: Source): string {
  const seconds = source.timestamp ? parseTimestamp(source.timestamp) : 0;
  return `https://www.youtube.com/embed/${source.video_id}?start=${seconds}&rel=0`;
}

function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function getLogoUrl(col: Collection | undefined): string | null {
  if (!col?.logo) return null;
  return col.logo.startsWith("/")
    ? `https://mindvault.ikigai-dynamics.com${col.logo}`
    : col.logo;
}

interface ChatEntry {
  question: string;
  answer: string;
  sources: Source[];
  channel: string;
  channelDisplay: string;
}

interface HeroLiveDemoProps {
  defaultChannel?: string;
  defaultQuestionShort?: string;
  defaultQuestionLong?: string;
}

export function HeroLiveDemo({
  defaultChannel = "andrew_huberman",
  defaultQuestionShort: propQuestionShort,
  defaultQuestionLong: propQuestionLong,
}: HeroLiveDemoProps = {}) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedChannel, setSelectedChannel] = useState(defaultChannel);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(TRIAL_LIMIT);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [buttonPressed, setButtonPressed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Responsive question — long on desktop, short on mobile
  const qShort = propQuestionShort || DEFAULT_QUESTION_SHORT;
  const qLong = propQuestionLong || DEFAULT_QUESTION_LONG;
  const [defaultQuestion, setDefaultQuestion] = useState(qShort);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDefaultQuestion(window.innerWidth >= 640 ? qLong : qShort);
    }
  }, [qShort, qLong]);

  // Typing animation state
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch collections
  useEffect(() => {
    fetch(`${API_BASE_URL}/collections`)
      .then((r) => r.json())
      .then((data: Collection[]) => {
        const HIDDEN = ["industrie_und_handelskammer_cottbus", "btu_cottbus_senftenberg", "doctor_sethi"];
        setCollections(
          data.filter((c: Collection) => !HIDDEN.includes(c.name))
            .sort((a: Collection, b: Collection) => a.display_name.localeCompare(b.display_name))
        );
      })
      .catch(() => {});
  }, []);

  // Check trial status
  useEffect(() => {
    const screen = getScreenInfo();
    fetch("/api/trial", { headers: { "x-screen-info": screen } })
      .then((r) => r.json())
      .then((data) => setRemaining(data.remaining))
      .catch(() => {});
  }, []);

  // Start typing only when widget scrolls into view
  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => { if (el) obs.unobserve(el); };
  }, []);

  // Start typing after visible + delay
  useEffect(() => {
    if (!isVisible || selectedChannel !== defaultChannel) return;
    const startDelay = setTimeout(() => setIsTyping(true), 600);
    return () => clearTimeout(startDelay);
  }, [isVisible, selectedChannel]);

  // Character-by-character typing
  useEffect(() => {
    if (!isTyping || hasAutoSearched) return;
    if (typedText.length < defaultQuestion.length) {
      const timeout = setTimeout(() => {
        const next = defaultQuestion.slice(0, typedText.length + 1);
        setTypedText(next);
        setQuestion(next);
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    }
    // Typing done — wait 1s, animate button press, then submit
    const timeout = setTimeout(() => {
      setButtonPressed(true);
      setTimeout(() => {
        setButtonPressed(false);
        setHasAutoSearched(true);
      }, 200);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [typedText, isTyping, hasAutoSearched, defaultQuestion]);

  // Auto-submit after typing completes
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (hasAutoSearched && !hasAutoSubmitted.current && chatHistory.length === 0 && !loading && selectedChannel === defaultChannel) {
      hasAutoSubmitted.current = true;
      handleSearch(defaultQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAutoSearched]);

  const selectedCollection = collections.find(
    (c) => c.name === selectedChannel
  );
  const logoUrl =
    getLogoUrl(selectedCollection) ||
    (selectedChannel === "andrew_huberman" ? HUBERMAN_LOGO : null) ||
    (selectedChannel === "unchartedx" ? "https://mindvault.ikigai-dynamics.com/static/UnchartedX.jpg" : null);
  const channelDisplayName =
    selectedCollection?.display_name || "Andrew Huberman";

  function handleChannelChange(name: string) {
    setSelectedChannel(name);
    setDropdownOpen(false);
    setChatHistory([]);
    setPendingQuestion(null);
    setError(null);
    setQuestion("");
    setExpandedSource(null);
    setExpandedSources(new Set());
    setNudgeDismissed(false);
    setIsTyping(false);
    setTypedText("");
    setHasAutoSearched(true);
    if (window.innerWidth >= 640) {
      inputRef.current?.focus();
    }
  }

  async function handleSearch(q?: string) {
    const query = (q || question).trim();
    if (!query || loading) return;

    // Allow cached responses even when trial exhausted (demo animation)
    const isCached = !!CACHED_RESPONSES[`${selectedChannel}:${query}`] || (selectedChannel === "andrew_huberman" && !!CACHED_RESPONSES[query]);
    if (remaining <= 0 && !isCached) return;

    const currentChannel = selectedChannel;
    const currentDisplayName = channelDisplayName;
    setQuestion("");
    setError(null);
    setExpandedSource(null);
    setPendingQuestion(query);
    // Only scroll on manual questions (not the auto-submitted first one)
    if (chatHistory.length > 0) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
    }

    // Check for cached response (Huberman demo queries)
    const cached = CACHED_RESPONSES[`${currentChannel}:${query}`] || (currentChannel === "andrew_huberman" ? CACHED_RESPONSES[query] : undefined);
    if (cached) {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1200));
      setPendingQuestion(null);
      setChatHistory((prev) => [...prev, {
        question: query, answer: cached.answer, sources: cached.sources,
        channel: currentChannel, channelDisplay: currentDisplayName,
      }]);
      setLoading(false);
      track("search", { channelId: currentChannel, query, resultCount: cached.sources.length });
      return;
    }

    setLoading(true);

    try {
      const screen = getScreenInfo();
      const incRes = await fetch("/api/trial", {
        method: "POST",
        headers: { "x-screen-info": screen },
      });

      if (incRes.status === 429) {
        setRemaining(0);
        setLoading(false);
        return;
      }

      const incData = await incRes.json();
      setRemaining(incData.remaining);

      const data = await queryCollection(currentChannel, query, []);
      track("search", { channelId: currentChannel, query, resultCount: data.sources?.length ?? 0 });
      setPendingQuestion(null);
      setChatHistory((prev) => [...prev, {
        question: query, answer: data.answer, sources: data.sources?.slice(0, 5) || [],
        channel: currentChannel, channelDisplay: currentDisplayName,
      }]);
    } catch {
      setPendingQuestion(null);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExampleClick(q: string) {
    setQuestion(q);
    handleSearch(q);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    // If user starts typing manually, stop the animation
    if (isTyping && !hasAutoSearched) {
      setIsTyping(false);
      setHasAutoSearched(true);
    }
    setQuestion(e.target.value);
  }

  const searched = chatHistory.length > 0;

  const exampleQuestions =
    selectedChannel === "andrew_huberman"
      ? HUBERMAN_EXAMPLES
      : [
          `What are the main topics ${channelDisplayName} covers?`,
          `What\u2019s the most important insight from ${channelDisplayName}?`,
          `What does ${channelDisplayName} recommend?`,
        ];

  // Show cursor during typing animation
  const showCursor = isTyping && !hasAutoSearched && typedText.length < defaultQuestion.length;

  return (
    <div ref={widgetRef} className="relative mx-auto w-full max-w-[900px] overflow-hidden">
      {/* Glow backdrop — no blur on mobile (iOS Safari counts blur beyond overflow:hidden) */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-primary/[0.08] sm:blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border-2 border-white/10 bg-[#1a1a1a] shadow-[0_0_10px_rgba(101,174,76,0.08)] sm:shadow-[0_0_40px_rgba(101,174,76,0.1)]">
        {/* Window chrome with channel picker */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 md:px-8">
          <div className="flex items-center gap-2">
            <div className="hidden gap-1.5 sm:flex">
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            </div>

            {/* Channel picker dropdown */}
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-text/40 sm:ml-2">
              Channel
            </span>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-1.5 transition-colors hover:bg-white/[0.08]"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-sm object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-4 w-4 rounded-sm bg-primary/60" />
                )}
                <span className="text-xs font-medium text-cream">
                  {channelDisplayName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-text/40" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 max-h-72 w-64 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#1C1D1F] shadow-lg sm:w-72 sm:shadow-xl">
                    {collections.map((col) => {
                      const colLogo = getLogoUrl(col);
                      return (
                        <button
                          key={col.name}
                          onClick={() => handleChannelChange(col.name)}
                          className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[12px] transition-colors hover:bg-white/[0.06] ${
                            col.name === selectedChannel
                              ? "bg-white/[0.04] text-cream"
                              : "text-gray-text/80"
                          }`}
                        >
                          {colLogo ? (
                            <Image
                              src={colLogo}
                              alt=""
                              width={20}
                              height={20}
                              className="h-5 w-5 rounded-sm object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-white/[0.06] text-[8px] font-bold text-gray-text">
                              {col.display_name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                          {col.display_name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question counter */}
          {remaining > 0 ? (
            <span className={`text-[11px] font-medium ${remaining === 1 ? "text-orange-400" : "text-gray-text/60"}`}>
              {remaining} free question{remaining !== 1 ? "s" : ""} remaining
            </span>
          ) : (
            <Link href="/signup" className="text-[11px] font-medium text-primary transition-colors hover:text-primary-hover">
              Sign up for more &rarr;
            </Link>
          )}
        </div>

        {/* Input area — at the top, or upgrade wall when exhausted */}
        {remaining <= 0 && chatHistory.length > 0 ? (
          <div className="border-b border-white/[0.06] px-3 py-5 sm:px-5 md:px-8">
            <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.05] to-transparent p-5">
              <p className="text-sm font-semibold text-cream">You&apos;ve used your 3 free questions</p>
              <p className="mt-1 text-xs text-gray-text">Create a free account for 3 daily questions, or go Pro for unlimited.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link href="/signup" className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10">
                  Sign up free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/pricing" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                  Go Pro &mdash; $19/mo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-2 text-[10px] text-gray-text/40">No credit card needed for free plan</p>
            </div>
          </div>
        ) : (
          <div className="border-b border-white/[0.06] px-3 pt-4 pb-3 sm:px-5 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 transition-colors focus-within:border-primary/30 md:px-5 md:py-4">
                <Search className="h-4 w-4 shrink-0 text-gray-text/60 md:h-5 md:w-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={searched ? `Ask another question...` : `Ask ${channelDisplayName} anything...`}
                  className="flex-1 bg-transparent text-base text-cream placeholder:text-gray-text/40 focus:outline-none"
                />
                {showCursor && (
                  <span className="pointer-events-none absolute right-3 inline-block h-5 w-[2px] animate-pulse bg-primary md:right-5" />
                )}
              </div>
              <button onClick={() => handleSearch()} disabled={loading || !question.trim() || remaining <= 0} className={`h-14 shrink-0 rounded-xl bg-primary px-8 text-base font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary ${buttonPressed ? "scale-95 brightness-110 shadow-[0_0_16px_rgba(101,174,76,0.4)]" : ""}`}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        )}

        {/* Content area — examples before first search, then chat history */}
        <div className="max-h-[500px] overflow-y-auto sm:max-h-[60vh]">
          {/* Example question cards — only before first search */}
          {!searched && !loading && (
            <div className="px-3 py-4 sm:px-5 md:px-8">
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 md:flex md:items-center md:justify-center md:gap-6">
                <span className="flex items-center gap-1.5 text-xs text-gray-text/60">
                  <Zap className="h-3 w-3 text-primary/60" /> 3-second answers
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-text/60">
                  <MapPin className="h-3 w-3 text-primary/60" /> Exact timestamps
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-text/60">
                  <Link2 className="h-3 w-3 text-primary/60" /> Direct video links
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-text/60">
                  <Quote className="h-3 w-3 text-primary/60" /> Real quotes, verifiable
                </span>
              </div>
              <div className="mt-4">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-gray-text/40">
                  Examples
                </span>
                <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                  {exampleQuestions.map((q) => (
                    <button key={q} onClick={() => handleExampleClick(q)} className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-left text-[13px] leading-relaxed text-gray-text/70 transition-colors duration-200 hover:border-primary/30 hover:text-cream">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat history */}
          {chatHistory.map((entry, idx) => {
            const sourceKey = `${idx}`;
            return (
              <div key={idx} className="animate-[fadeUp_0.4s_ease-out] border-t border-white/[0.04] px-3 py-4 sm:px-5 md:px-8">
                {/* User question */}
                <div className="mb-3 flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-medium text-cream">
                    {entry.question}
                  </div>
                </div>
                {/* AI answer */}
                <div className="mb-3 rounded-xl border border-[#1E1F21] bg-[#111213] p-3 sm:p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Image src="/TubeVault_Logo_noBG.png" alt="TubeVault" width={18} height={18} className="h-[18px] w-[18px]" />
                    <span className="text-[10px] font-semibold text-gray-text/50">{entry.channelDisplay}</span>
                  </div>
                  <div className="prose-invert prose-sm max-w-none break-words text-sm leading-relaxed text-cream/90" dangerouslySetInnerHTML={{ __html: entry.answer.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />") }} />
                </div>
                {/* Sources — 2 visible, rest behind "+X more" */}
                {entry.sources.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-gray-text/40">Sources</span>
                    {(expandedSources.has(idx) ? entry.sources : entry.sources.slice(0, 2)).map((source, si) => {
                      const sKey = `${sourceKey}-${si}`;
                      return (
                        <div key={si} className="rounded-lg border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-primary/20">
                          <button onClick={() => setExpandedSource(expandedSource === sKey ? null : sKey)} className="flex w-full items-start gap-2 p-2 text-left sm:gap-3 sm:p-3">
                            {source.video_id && (
                              <Image src={getThumbnailUrl(source.video_id)} alt="" width={120} height={68} className="h-[40px] w-[70px] shrink-0 rounded-md object-cover" unoptimized />
                            )}
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-xs font-medium text-cream">{source.title}</span>
                                <ChevronRight className={`h-3 w-3 shrink-0 text-gray-text/30 transition-transform ${expandedSource === sKey ? "rotate-90" : ""}`} />
                              </div>
                              <div className="mt-0.5 flex items-center gap-2">
                                {source.timestamp && (
                                  <span className="flex items-center gap-1 text-[11px] text-primary/70">
                                    <Clock className="h-2.5 w-2.5" />{source.timestamp}
                                  </span>
                                )}
                              </div>
                              {source.text && expandedSource !== sKey && (
                                <p className="mt-1 break-words text-[11px] leading-relaxed text-gray-text/60">
                                  {source.text.length <= 100 ? source.text : source.text.slice(0, source.text.lastIndexOf(" ", 100)) + "..."}
                                </p>
                              )}
                            </div>
                          </button>
                          {expandedSource === sKey && (
                            <div className="overflow-hidden border-t border-white/[0.06] px-3 pb-3 pt-3 animate-[fadeUp_0.3s_ease-out]">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                                {source.video_id && (
                                  <div className="aspect-video w-full overflow-hidden rounded-lg sm:w-[38%] sm:shrink-0">
                                    <iframe src={getYouTubeEmbedUrl(source)} title={source.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" />
                                  </div>
                                )}
                                {source.text && (
                                  <div className="flex flex-1 flex-col rounded-lg bg-white/[0.03] p-3">
                                    <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-text/50">Transcript excerpt</span>
                                    <p className="flex-1 break-words text-[12px] leading-[1.7] text-cream/70 italic">&ldquo;{source.text}&rdquo;</p>
                                  </div>
                                )}
                              </div>
                              <a href={getYouTubeUrl(source)} target="_blank" rel="noopener noreferrer" onClick={() => track("timestamp_click", { channelId: entry.channel, metadata: { videoId: source.video_id } })} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary/80 transition-colors hover:text-primary">
                                Open on YouTube <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {entry.sources.length > 2 && !expandedSources.has(idx) && (
                      <button
                        onClick={() => setExpandedSources((prev) => new Set(prev).add(idx))}
                        className="w-full rounded-lg border border-white/[0.06] py-2 text-center text-xs text-gray-text/50 transition-colors hover:border-primary/20 hover:text-cream"
                      >
                        +{entry.sources.length - 2} more sources
                      </button>
                    )}
                  </div>
                )}
                {/* Inline nudge after each answer */}
                {!nudgeDismissed && remaining > 0 && idx === chatHistory.length - 1 && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <div>
                      <p className="text-sm font-medium text-cream">That took 3 seconds</p>
                      <p className={`text-xs ${remaining === 1 ? "text-orange-400" : "text-primary"}`}>
                        {remaining} free question{remaining !== 1 ? "s" : ""} remaining
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/signup" className="text-xs font-medium text-primary transition-colors hover:text-primary-hover">Create free account &rarr;</Link>
                      <button onClick={() => setNudgeDismissed(true)} className="text-gray-text/30 hover:text-cream"><span className="text-xs">&times;</span></button>
                    </div>
                  </div>
                )}
                {/* Inline input after last answer so user doesn't have to scroll up */}
                {idx === chatHistory.length - 1 && remaining > 0 && !loading && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 transition-colors focus-within:border-primary/30">
                      <Search className="h-4 w-4 shrink-0 text-gray-text/40" />
                      <input
                        type="text"
                        value={question}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ask ${channelDisplayName} anything...`}
                        className="flex-1 bg-transparent text-sm text-cream placeholder:text-gray-text/40 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSearch()}
                        disabled={loading || !question.trim()}
                        className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pending question + loading */}
          {pendingQuestion && (
            <div className="animate-[fadeUp_0.3s_ease-out] border-t border-white/[0.04] px-3 py-4 sm:px-5 md:px-8">
              <div className="mb-3 flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-medium text-cream">
                  {pendingQuestion}
                </div>
              </div>
              {loading && (
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-4">
                  <svg className="h-4 w-4 animate-spin text-primary" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <span className="text-sm text-gray-text">TubeVault is searching...</span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 pb-4 sm:px-5 md:px-8">
              <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

      </div>
    </div>
  );
}
