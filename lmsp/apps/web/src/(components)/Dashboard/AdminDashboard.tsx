import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileSearch,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Trash2,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';
import {
  useUploadDocumentsMutation,
  useQuestionPaperScraperMutation,
  useQuestionAnalyzerMutation,
} from '@my-monorepo/store';
import { usePostQuestionPatternMutation, usePostScrapQuestionsMutation } from '@my-monorepo/store/src/redux/api/examApi';


const demoData = 
{
  "status": "success",
  "total_questions": 200,
  "data": [
    {
      "question_number": 1,
      "question_text": "A = {x : x স্বাভাবিক সংখ্যাা এবং x <= 5 হলে}, P(A) এর উপাদান সংখ্যাা হবে:",
      "options": {
        "ক": "64",
        "খ": "32",
        "গ": "16",
        "ঘ": "8"
      },
      "correct_answer": null
    },
    {
      "question_number": 2,
      "question_text": "ঘড়ির ঘণ্টাার কাঁটা ও মিনিটের কাঁটা একদিনে কতবার মিলিত হয়?",
      "options": {
        "ক": "১২",
        "খ": "১৮",
        "গ": "২২",
        "ঘ": "২৪"
      },
      "correct_answer": null
    },
    {
      "question_number": 3,
      "question_text": "কি উটার সায়েে Trojan Horse একটি-",
      "options": {
        "ক": "ছবি এডিট করার সফটওয়্যাার",
        "খ": "অপারেটিং সিে ম",
        "গ": "প্রো গ্রামিংং ল্যাাঙ্গুয়েজ",
        "ঘ": "ম্যাালওয়্যাার"
      },
      "correct_answer": null
    },
    {
      "question_number": 4,
      "question_text": "জলবায়ুু কূটনীতিতে 'Common but Differentiated Responsibilities (CBDR)' নীতি প্রথম কোথায় স্বীকৃত হয়েছিল?",
      "options": {
        "ক": "রিও-ঘোষণা",
        "খ": "কিয়োটো প্রো টোকল",
        "গ": "প্যাারিস চুি",
        "ঘ": "স্টকহোম ঘোষণা"
      },
      "correct_answer": null
    },
    {
      "question_number": 5,
      "question_text": "২০৩০ সালের মধ্যে টেকসই উন্নয়ন লক্ষ্যমাত্রা অর্জনে ইফাদ (IFAD), SDG এর কোন্ দুটি লক্ষ্যমাত্রা নিয়ে কাজ করে?",
      "options": {
        "ক": "৭ ও ৯",
        "খ": "১১ ও ১৩",
        "গ": "৩ ও ৬",
        "ঘ": "১ ও ২"
      },
      "correct_answer": null
    },
    {
      "question_number": 6,
      "question_text": "১৩৫০ বঙ্গাে র দুর্ভিক্ষ নিয়ে রচিত উপন্যাাস কোনটি?",
      "options": {
        "ক": "ইছামতি",
        "খ": "অশনি সংকেত",
        "গ": "আরণ্যক",
        "ঘ": "বিষাদসিন্ধুু"
      },
      "correct_answer": null
    },
    {
      "question_number": 7,
      "question_text": "The killing of albatross in The Rime of the Ancient Mariner was indicative of-",
      "options": {
        "ক": "a trigger-happy Mariner",
        "খ": "the essential irrationality of man",
        "গ": "a superstitious Mariner",
        "ঘ": "the Mariner as a skillful fowler"
      },
      "correct_answer": null
    },
    {
      "question_number": 8,
      "question_text": "একটি আয়না থেকে একটি বস্তু আয়নার পৃষ্ঠ থেকে পৃের লম্ব বরাবর সেকেে ১০ সে.মি. বেগে চলতে শুরু করল। ৪ সেকেন্ড পর বস্তুটি ও তার প্রতিবিের মধ্যে দূরত্ব কত হবে?",
      "options": {
        "ক": "৪০ সে.মি.",
        "খ": "১৬০ সে.মি.",
        "গ": "৮০ সে.মি.",
        "ঘ": "০ সে.মি."
      },
      "correct_answer": null
    },
    {
      "question_number": 9,
      "question_text": "বাংলাদেশের অর্থনৈতিক নীতি ও উন্নয়ন পরিকল্পনা অনুমোদনের সর্বোচ্চ কর্তৃপক্ষ কোনটি?",
      "options": {
        "ক": "পরিকল্পনা কমিশন",
        "খ": "অর্থ মন্ত্রনালয়",
        "গ": "পরিকল্পনা মন্ত্রনালয়",
        "ঘ": "জাতীয় অর্থনৈতিক পরিষদের নির্বাহি কমিটি"
      },
      "correct_answer": null
    },
    {
      "question_number": 10,
      "question_text": "'ঢাকা মুসলিম সাহিত্য সমাজ' কত সালে প্রতিিত হয়?",
      "options": {
        "ক": "১৯২০ সালে",
        "খ": "১৯২৬ সালে",
        "গ": "১৯২৫ সালে",
        "ঘ": "১৯৩০ সালে"
      },
      "correct_answer": null
    },
    {
      "question_number": 11,
      "question_text": "মাি ল্যাাটারাল ইনভেস্টমেন্ট গ্যাারাি এজেি (MIGA) কোন্ সংস্থাার অংশ?",
      "options": {
        "ক": "বিশ্বব্যাংাংক গ্রুপ",
        "খ": "আন্তর্জাতিক মুদ্রা তহবিল",
        "গ": "জাতিসংঘ উন্নয়ন কর্মসূচি",
        "ঘ": "এশীয় অবকাঠামো বিনিয়োগ ব্যাংাংক (AIIB)"
      },
      "correct_answer": null
    },
    {
      "question_number": 12,
      "question_text": "টেকসই উন্নয়নের জন্য সু-শাসন অপরিহার্য কারন এটি-",
      "options": {
        "ক": "দ্রুত শিল্পায়ন নিশ্চিত করে",
        "খ": "অর্থনৈতিক প্রবৃদ্ধি ও সামাজিক ন্যাায়ের ভারসাম্য রক্ষা করে",
        "গ": "জনসংখ্যাা হ্রাস করে",
        "ঘ": "রাজনৈতিক দ্বন্দ্ব দূর করে"
      },
      "correct_answer": null
    },
    {
      "question_number": 13,
      "question_text": "'স্বর্গ' শব্দের সঠিক সমার্থক শব্দজোড়া কোনটি?",
      "options": {
        "ক": "হরিদশ্ব, বিবদান",
        "খ": "ক্ষিতি, উর্বী",
        "গ": "দিনমণি, দিন নাথ",
        "ঘ": "ত্রিদিব, সুরপুর"
      },
      "correct_answer": null
    },
    {
      "question_number": 14,
      "question_text": "বাংলাদেশ _____ সাল থেকে গ্রীষ্মকালীন অলিম্পিকে অংশগ্রহন করে আসছে।",
      "options": {
        "ক": "১৯৮৫",
        "খ": "১৯৮৪",
        "গ": "১৯৮৬",
        "ঘ": "১৯৮৩"
      },
      "correct_answer": null
    },
    {
      "question_number": 15,
      "question_text": "কোনটি কম্বিনেশনাল লজিক সার্কিট নয়?",
      "options": {
        "ক": "রেজিস্টার",
        "খ": "ডিকোডার",
        "গ": "মাল্টিপ্লেক্সার",
        "ঘ": "NAND গেট"
      },
      "correct_answer": null
    },
    {
      "question_number": 16,
      "question_text": "বাংলাদেশের সর্বশেষ সিটি কর্পোরেশন কোনটি?",
      "options": {
        "ক": "ঢাকা উত্তর",
        "খ": "ময়মনসিংহ",
        "গ": "বগুড়া",
        "ঘ": "রংপুর"
      },
      "correct_answer": null
    },
    {
      "question_number": 17,
      "question_text": "স্মার্টফোনে GPS ব্যবহারের জন্য কোনটি প্রয়োজন?",
      "options": {
        "ক": "DHCP",
        "খ": "Accelerometer",
        "গ": "Gyroscope",
        "ঘ": "Satellite Signal"
      },
      "correct_answer": null
    },
    {
      "question_number": 18,
      "question_text": "‘ ______ ’ কনভেনশন' বিপজ্জনক বর্জ্যের আন্তঃসীমান্ত পরিবহন নিয়ন্ত্রণ করে।",
      "options": {
        "ক": "স্টকহোম",
        "খ": "রোটারডাম",
        "গ": "বাসেল",
        "ঘ": "মিনামাটা"
      },
      "correct_answer": null
    },
    {
      "question_number": 19,
      "question_text": "‘The villagers believed that he was an honest leader.’ Passive form of this sentence is:",
      "options": {
        "ক": "He was believed to be an honest leader",
        "খ": "He was believed to have been an honest leader",
        "গ": "He has been believed to be an honest leader",
        "ঘ": "He was believed he was an honest leader"
      },
      "correct_answer": null
    },
    {
      "question_number": 20,
      "question_text": "আন্তর্জাতিক অর্থায়নের ভিত্তি স্থাপনে ব্রেটন উডস্ (Bretton Woods) সম্মেলন কোথায় অনুষ্ঠিত হয়েছিল?",
      "options": {
        "ক": "নেদারল্যান্ডস",
        "খ": "নিউ ইয়র্ক",
        "গ": "নিউ হ্যাম্পশায়ার",
        "ঘ": "নিউ জার্সি"
      },
      "correct_answer": null
    },
    {
      "question_number": 21,
      "question_text": "আফ্রিকান উন্নয়ন ব্যাংকের সদর দপ্তর ______ অবস্থিত।",
      "options": {
        "ক": "নাইরোবি",
        "খ": "আবিদজান",
        "গ": "আদিস আবাবা",
        "ঘ": "লাগোস"
      },
      "correct_answer": null
    },
    {
      "question_number": 22,
      "question_text": "MRI কোন্ নীতিতে কাজ করে?",
      "options": {
        "ক": "শরীরের ত্রি-মাত্রিক চিত্র তৈরি করতে এক্স-রে ব্যবহার করে",
        "খ": "তেজস্ক্রিয় ট্রেসার দ্বারা নির্গত গামা-রে সনাক্তের মাধ্যমে",
        "গ": "শক্তিশালী চুম্বক এবং রেডিও তরঙ্গ ব্যবহার করে ইমেজ তৈরির মাধ্যমে",
        "ঘ": "উচ্চ ফ্রিকোয়েন্সি শব্দ তরঙ্গ ব্যবহার করে ইমেজ তৈরির মাধ্যমে"
      },
      "correct_answer": null
    },
    {
      "question_number": 23,
      "question_text": "কোন ফসলটি রপ্তানী বহুমুখীকরনে সম্ভাবনাময়?",
      "options": {
        "ক": "আউশ ধান",
        "খ": "তেলবীজ",
        "গ": "পাট",
        "ঘ": "আলু"
      },
      "correct_answer": null
    },
    {
      "question_number": 24,
      "question_text": "কোনটি মূল্যবোধের সারসত্তাকে প্রতিফলিত করে?",
      "options": {
        "ক": "কর্তৃপক্ষ কর্তৃক আরোপিত নিয়ম",
        "খ": "নৈতিক নির্দেশ ছাড়া প্রথা ও ঐতিহ্য",
        "গ": "নৈতিক আচরণ নির্দেশক বিশ্বাস ও নীতি",
        "ঘ": "সামাজিক শৃংখলার আইনি বাধ্যবাধকতা"
      },
      "correct_answer": null
    },
    {
      "question_number": 25,
      "question_text": "What gender is the word 'monarch'?",
      "options": {
        "ক": "masculine",
        "খ": "feminine",
        "গ": "neuter",
        "ঘ": "common"
      },
      "correct_answer": null
    },
    {
      "question_number": 26,
      "question_text": "Habeas Corpus writ দায়ের করা হয় সংবিধানের _____ অনুচ্ছেদ লঙ্ঘনের কারনে।",
      "options": {
        "ক": "৩১",
        "খ": "৩২",
        "গ": "৩৪",
        "ঘ": "৩৩"
      },
      "correct_answer": null
    },
    {
      "question_number": 27,
      "question_text": "কোন্ টিস্যু পেশীকে হাড়ের সাথে সংযুক্ত রাখে?",
      "options": {
        "ক": "তরুণাস্থি",
        "খ": "লিগামেন্ট",
        "গ": "টেন্ডন",
        "ঘ": "অ্যারিওলার টিস্যু"
      },
      "correct_answer": null
    },
    {
      "question_number": 28,
      "question_text": "'কাআ তরুবর পঞ্চ বি ডাল'- পদটির রচয়িতা কে?",
      "options": {
        "ক": "লুইপা",
        "খ": "ভুসুরুপা",
        "গ": "শবরপা",
        "ঘ": "কাহ্নপা"
      },
      "correct_answer": null
    },
    {
      "question_number": 29,
      "question_text": "Identify the compound sentence:",
      "options": {
        "ক": "Either you do it or you will be fined",
        "খ": "Unless you do it, you will be fined",
        "গ": "Do it or I shall fine you",
        "ঘ": "You have to do it, otherwise I will fine you"
      },
      "correct_answer": null
    },
    {
      "question_number": 30,
      "question_text": "মুক্তিযুদ্ধকে উপজীব্য করে 'যাত্রা' উপন্যাসটি লিখেছেন-",
      "options": {
        "ক": "শওকত ওসমান",
        "খ": "শহিদুল জহির",
        "গ": "শওকত আলী",
        "ঘ": "সেলিনা হোসেন"
      },
      "correct_answer": null
    },
    {
      "question_number": 31,
      "question_text": "স্বচ্ছতা কেন সু-শাসন সম্পর্কে নাগরিকের ধারনাকে উন্নত ও স্বচ্ছ করে?",
      "options": {
        "ক": "এটি প্রশাসনিক চাপ বাড়ায়",
        "খ": "এটি রাজনৈতিক প্রতিযোগিতা কমায়",
        "গ": "এটি জনগনের নজরদারি ও সচেতন মূল্যায়নের জন্য সুযোগ দেয়",
        "ঘ": "উপরের সবগুলো"
      },
      "correct_answer": null
    },
    {
      "question_number": 32,
      "question_text": "2/5, 3/5, 6/15 ভগ্নাংশগুলোর লঘিষ্ঠ সাধারণ গুণিতক (ল.সা.গু) হবে:",
      "options": {
        "ক": "7/5",
        "খ": "6/5",
        "গ": "1/15",
        "ঘ": "6/15"
      },
      "correct_answer": null
    },
    {
      "question_number": 33,
      "question_text": "'রাজপথ' শব্দের ব্যাসবাক্য কোনটি?",
      "options": {
        "ক": "রাজা ও পথ",
        "খ": "রাজার পথ",
        "গ": "বিশাল পথ",
        "ঘ": "পথের রাজা"
      },
      "correct_answer": null
    },
    {
      "question_number": 34,
      "question_text": "০.৫ × ০.০৫ × ০.০০৫=?",
      "options": {
        "ক": "০.১২৫",
        "খ": "০.০১২৫",
        "গ": "০.০০১২৫",
        "ঘ": "০.০০০১২৫"
      },
      "correct_answer": null
    },
    {
      "question_number": 35,
      "question_text": "কোন এলাকাটি বাংলাদেশের মুক্তিযুদ্ধকালীন জনযুদ্ধ ক্যাপ্টেন (অবঃ) আব্দুল হালিম চৌধুরীর দ্বারা গঠিত আঞ্চলিক বাহিনীর আওতাধীন এলাকা ছিল না?",
      "options": {
        "ক": "ধামরাই",
        "খ": "কেরানীগঞ্জ",
        "গ": "কালিয়াকৈর",
        "ঘ": "সাভার"
      },
      "correct_answer": null
    },
    {
      "question_number": 36,
      "question_text": "একটি বাক্সের মধ্যে একটি পেন্সিল আছে। বাক্সটি একটি তাকের উপরে অবস্থান করছে। তাকটি জানালার নিচে অবস্থান করছে। তাহলে নিচের কোন্ বাক্যটি উপরের বর্ণনার জন্য প্রযোজ্য হবে?",
      "options": {
        "ক": "পেন্সিলটি জানালার নিচে আছে",
        "খ": "পেন্সিলটি জানালার উপরে আছে",
        "গ": "পেন্সিলটি জানালার মধ্যে অবস্থান করছে",
        "ঘ": "বাক্সটি পেন্সিলের নিচে অবস্থান করছে"
      },
      "correct_answer": null
    },
    {
      "question_number": 37,
      "question_text": "কোনটি 'ভাত'এর প্রতিশব্দ?",
      "options": {
        "ক": "অলিপিক",
        "খ": "প্রভঞ্জন",
        "গ": "মহি",
        "ঘ": "তণ্ডুল"
      },
      "correct_answer": null
    },
    {
      "question_number": 38,
      "question_text": "উত্তর কোরিয়া ও দক্ষিণ কোরিয়ার মধ্যকার বিভক্তকারী রেখা হলো ______ উত্তর অক্ষাংশ ।",
      "options": {
        "ক": "৩৮°",
        "খ": "৩৪°",
        "গ": "৪৯°",
        "ঘ": "২৩.৫০°"
      },
      "correct_answer": null
    },
    {
      "question_number": 39,
      "question_text": "'বেতার, বিপত্নীক'-শব্দ দুটি কোন্ সমাসের উদাহরণ?",
      "options": {
        "ক": "নঞ বহুব্রীহি, বহুব্রীহি",
        "খ": "কর্মধারয়, বহুব্রীহি",
        "গ": "অব্যয়ীভাব, তৎপুরুষ",
        "ঘ": "তৃতীয়া তৎপুরুষ, দ্বিগু সমাস"
      },
      "correct_answer": null
    },
    {
      "question_number": 40,
      "question_text": "An element required in a paragraph for smooth flow of ideas is called a-",
      "options": {
        "ক": "transition sentence",
        "খ": "topic sentence",
        "গ": "supporting sentence",
        "ঘ": "concluding sentence"
      },
      "correct_answer": null
    },
    {
      "question_number": 41,
      "question_text": "বাংলাদেশ সরকার এবং পিসিজেএসএস (PCJSS)-এর মধ্যে পার্বত্য চট্টগ্রাম শান্তি চুক্তি কবে স্বাক্ষরিত হয়েছিল?",
      "options": {
        "ক": "০৪ ডিসেম্বর ১৯৯৫",
        "খ": "০৬ নভেম্বর ১৯৯৮",
        "গ": "০২ ডিসেম্বর ১৯৯৭",
        "ঘ": "০৭ ডিসেম্বর ১৯৯৮"
      },
      "correct_answer": null
    },
    {
      "question_number": 42,
      "question_text": "'Pixel' দ্বারা কী বুঝায়?",
      "options": {
        "ক": "Pixie land",
        "খ": "Person length",
        "গ": "Pixure length",
        "ঘ": "Picture element"
      },
      "correct_answer": null
    },
    {
      "question_number": 43,
      "question_text": "মূল্যবোধ ও শাসনের মধ্যে সম্পর্ক হলো-",
      "options": {
        "ক": "নৈতিক নীতি, নিয়ম ও রাজনৈতিক নির্দেশ মানা",
        "খ": "নৈতিক নীতি, স্বচ্ছতা ও সামাজিক দায়বদ্ধতা",
        "গ": "স্তরবিন্যাস, স্বচ্ছতা ও ঐতিহ্য",
        "ঘ": "নৈতিকতা ছাড়া প্রশাসনিক দক্ষতা"
      },
      "correct_answer": null
    },
    {
      "question_number": 44,
      "question_text": "লামিয়া একটি শ্রেণীর সামনে থেকে নবম এবং পিছন থেকে ৩৬তম হলে শ্রেণীতে শিক্ষার্থী কতজন?",
      "options": {
        "ক": "৪৪",
        "খ": "৪৫",
        "গ": "৪৬",
        "ঘ": "৪৮"
      },
      "correct_answer": null
    },
    {
      "question_number": 45,
      "question_text": "সমান দৈর্ঘ্যের দুইটি দড়ির একটি দিয়ে আয়তক্ষেত্রাকার বেষ্টনী তৈরী করা হয় এবং অপরটি দিয়ে বর্গক্ষেত্রাকার বেষ্টনী তৈরী করা হয়। কোন্‌ তথ্যটি সত্য?",
      "options": {
        "ক": "আয়তক্ষেত্রের ক্ষেত্রফল বর্গক্ষেত্রের চেয়ে বেশী",
        "খ": "বর্গক্ষেত্রের ক্ষেত্রফল আয়তক্ষেত্রের চেয়ে বেশী",
        "গ": "উভয়ের ক্ষেত্রফল সমান",
        "ঘ": "কোনটির ক্ষেত্রফল বেশী বা উভয়ের ক্ষেত্রফল সমান কিনা তা বর্ণিত তথ্য থেকে নির্ণয় করা সম্ভব নয়"
      },
      "correct_answer": null
    },
    {
      "question_number": 46,
      "question_text": "‘_____’ ব্রিকস (BRICS) কর্তৃক অবকাঠামো এবং টেকসই উন্নয়ন প্রকল্পের অর্থায়নের লক্ষ্যে প্রতিষ্ঠিত হয়।",
      "options": {
        "ক": "NDB",
        "খ": "ADB",
        "গ": "AIIB",
        "ঘ": "IMF"
      },
      "correct_answer": null
    },
    {
      "question_number": 47,
      "question_text": "কোন্ বাক্যে সমধাতুজ কর্ম রয়েছে?",
      "options": {
        "ক": "সে বই পড়ছে।",
        "খ": "সে গভীর চিন্তায় মগ্ন।",
        "গ": "আজ এমন ঘুম ঘুমিয়েছি!",
        "ঘ": "সে খেলা করছে।"
      },
      "correct_answer": null
    },
    {
      "question_number": 48,
      "question_text": "কোনটি সুশাসনের অনুপস্থিতিতে সমাজ যে 'hidden cost' বহন করে তার উৎকৃষ্ট উদাহরন?",
      "options": {
        "ক": "কর আদায়ের হার বৃদ্ধি",
        "খ": "মেধা পাচার",
        "গ": "অবকাঠামো সম্প্রসারন",
        "ঘ": "রপ্তানি আয় বৃদ্ধি"
      },
      "correct_answer": null
    },
    {
      "question_number": 49,
      "question_text": "যদি logx 324 = 4 হয় তবে x এর মান হবে:",
      "options": {
        "ক": "2√3",
        "খ": "4",
        "গ": "3√3",
        "ঘ": "3√2"
      },
      "correct_answer": null
    },
    {
      "question_number": 50,
      "question_text": "কোনটি জাতিসংঘের প্রতিষ্ঠান নয়?",
      "options": {
        "ক": "ইউনিসেফ",
        "খ": "ইউনেস্কো",
        "গ": "ডিউটিও",
        "ঘ": "আইএলও"
      },
      "correct_answer": null
    },
    {
      "question_number": 51,
      "question_text": "সংবাদপত্রের স্বাধীনতা কোন্ ধরনের অধিকার?",
      "options": {
        "ক": "ব্যক্তিগত",
        "খ": "সামাজিক",
        "গ": "রাষ্ট্রীয়",
        "ঘ": "নীতিগত"
      },
      "correct_answer": null
    },
    {
      "question_number": 52,
      "question_text": "The lines 'A Book of Verses underneath the Bough, / A Jug of Wine, a Loaf of Bread and Thou / Beside me singing in the Wilderness... 'are taken from a famous translation work by-",
      "options": {
        "ক": "Scott Fitzgerald",
        "খ": "Edward Fitzgerald",
        "গ": "William Fitzgerald",
        "ঘ": "Gerald Fitzgerald"
      },
      "correct_answer": null
    },
    {
      "question_number": 53,
      "question_text": "২০২৩ সালের এপ্রিল থেকে কোন্ বিদ্রোহী আধাসামরিক গোষ্ঠী সুদানের সশস্ত্র বাহিনীর বিরুদ্ধে গৃহযুদ্ধে লিপ্ত?",
      "options": {
        "ক": "আল শাবাব",
        "খ": "জান জাউইদ",
        "গ": "ফ্রি সুদান মুভমেন্ট",
        "ঘ": "র‍্যাপিড সাপোর্ট ফোর্স (RSF)"
      },
      "correct_answer": null
    },
    {
      "question_number": 54,
      "question_text": "‘Helena said I took the laptop home with me.’ Its indirect form is-",
      "options": {
        "ক": "Helena said that she took the laptop home with her",
        "খ": "Helena said that she had taken the laptop home with her",
        "গ": "Helena confirmed that she has taken the laptop home with her",
        "ঘ": "Helena told that she had the laptop taken home with her"
      },
      "correct_answer": null
    },
    {
      "question_number": 55,
      "question_text": "যদি a/b = b/c = 2/3 হয়, তবে a : c এর মান কত হবে?",
      "options": {
        "ক": "2 : 3",
        "খ": "3 : 4",
        "গ": "4 : 9",
        "ঘ": "9 : 4"
      },
      "correct_answer": null
    },
    {
      "question_number": 56,
      "question_text": "শ্রমনির্ভর অর্থনীতি থেকে উৎপাদন ভিত্তিক অর্থনীতিতে রূপান্তরের পথে বাংলাদেশের সবচেয়ে বড় বাধা কোনটি?",
      "options": {
        "ক": "শিল্পাঞ্চলের অভাব",
        "খ": "রাজনৈতিক অস্থিরতা",
        "গ": "দক্ষ মানবসম্পদের ঘাটতি এবং শিক্ষার সাথে কর্মক্ষেত্রের অসামঞ্জস্য",
        "ঘ": "ক্ষুদ্রঋণের স্বল্পতা"
      },
      "correct_answer": null
    },
    {
      "question_number": 57,
      "question_text": "কোনটি সঠিক বানান?",
      "options": {
        "ক": "Gazete",
        "খ": "Gazzete",
        "গ": "Gaggete",
        "ঘ": "Gazette"
      },
      "correct_answer": null
    },
    {
      "question_number": 58,
      "question_text": "মূল্যবোধ ও সু শাসনের উপস্থিতি জাতীয় উন্নয়নের কোন্ দিকটিকে বেশি টেকসই করে তোলে?",
      "options": {
        "ক": "স্বল্পমেয়াদি প্রবৃদ্ধি",
        "খ": "অবকাঠামো নির্মান",
        "গ": "মানব সম্পদ উন্নয়ন",
        "ঘ": "আমলাতান্ত্রিক নিয়ন্ত্রণ"
      },
      "correct_answer": null
    },
    {
      "question_number": 59,
      "question_text": "'প্রাচ্য' শব্দের বিপরীত শব্দ কোনটি?",
      "options": {
        "ক": "প্রতীচ্য",
        "খ": "প্রাচ্যহীন",
        "গ": "অপ্রাচ্য",
        "ঘ": "নবীন"
      },
      "correct_answer": null
    },
    {
      "question_number": 60,
      "question_text": "বিশ্ব অর্থনীতিতে 'পেপার গোল্ড' (Paper Gold) বলতে কী বোঝায়?",
      "options": {
        "ক": "বিশ্বব্যাংকের সুবিধালাভ",
        "খ": "বিশেষ উত্তোলন অধিকার (SDR)",
        "গ": "স্বর্ণের মানসম্পন্ন ভিত্তিতে মুদ্রা",
        "ঘ": "ঘাটতি অর্থায়ন"
      },
      "correct_answer": null
    },
    {
      "question_number": 61,
      "question_text": "Which of these works contains a defence of the right of freedom of speech and expression?",
      "options": {
        "ক": "Holy Living and Holy Dying",
        "খ": "Areopagitica",
        "গ": "Religio Medici",
        "ঘ": "A Free Man's Worship"
      },
      "correct_answer": null
    },
    {
      "question_number": 62,
      "question_text": "একজন টাইপ-১ ডায়াবেটিক রোগীর ক্ষেত্রে কোন বক্তব্যটি সঠিক?",
      "options": {
        "ক": "নির্দিষ্ট কোষের ইনসুলিন ধ্বংসের কারণে অগ্ন্যাশয় অপর্যাপ্ত ইনসুলিন তৈরি করে",
        "খ": "বিটা কোষগুলির অটো-ইমিউন প্রতিরোধিতা",
        "গ": "অগ্ন্যাশয়ের আলফা কোষ দ্বারা গ্লুকাগনের অতিরিক্ত উৎপাদন",
        "ঘ": "প্রো-ইনসুলিন থেকে ইনসুলিনে রূপান্তরে ত্রুটি"
      },
      "correct_answer": null
    },
    {
      "question_number": 63,
      "question_text": "Themes like racial prejudice, oppressive power dynamics, unbridgeable gulf between Eastern & Western cultures, etc. are best exemplified in-",
      "options": {
        "ক": "Shadow of the Moon by MM Kaye",
        "খ": "Bhowani Junction by John Masters",
        "গ": "Kim by Rudyard Kipling",
        "ঘ": "A Passage to India by EM Forster"
      },
      "correct_answer": null
    },
    {
      "question_number": 64,
      "question_text": "x⁴ − 2x + 1 কে x-3 দিয়ে ভাগ করলে ভাগশেষ কত হবে?",
      "options": {
        "ক": "2",
        "খ": "81",
        "গ": "70",
        "ঘ": "76"
      },
      "correct_answer": null
    },
    {
      "question_number": 65,
      "question_text": "সাধারণের দৃষ্টিতে কোনটি মূল্যবোধ সম্পন্ন শাসন ব্যবস্থার বৈশিষ্ট্য?",
      "options": {
        "ক": "আইনের নির্বাচনী প্রয়োগ",
        "খ": "নাগরিকের অংশগ্রহণ",
        "গ": "কর্তৃত্ববাদ",
        "ঘ": "গোপনীয়তা"
      },
      "correct_answer": null
    },
    {
      "question_number": 66,
      "question_text": "It is no good falling in love at first sight. Here the word \"falling\" is a/an -",
      "options": {
        "ক": "participle",
        "খ": "infinitive",
        "গ": "gerund",
        "ঘ": "verbal noun"
      },
      "correct_answer": null
    },
    {
      "question_number": 67,
      "question_text": "| 3x-1 | < 2 এর সমাধান সেট হবে:",
      "options": {
        "ক": "(-1/3, 0)",
        "খ": "(-1/3, ∞)",
        "গ": "(-1/3, 1)",
        "ঘ": "(∞, 1/3)"
      },
      "correct_answer": null
    },
    {
      "question_number": 68,
      "question_text": "বাংলাদেশের দীর্ঘতম নদী কোনটি?",
      "options": {
        "ক": "পদ্মা",
        "খ": "মেঘনা",
        "গ": "যমুনা",
        "ঘ": "ব্রহ্মপুত্র"
      },
      "correct_answer": null
    },
    {
      "question_number": 69,
      "question_text": "The book that she recommended turned out to be very helpful. Here the underlined clause is a-",
      "options": {
        "ক": "relative clause",
        "খ": "noun clause",
        "গ": "adverbial clause",
        "ঘ": "independent clause"
      },
      "correct_answer": null
    },
    {
      "question_number": 70,
      "question_text": "Which novel chronicles intense, destructive love fueling multigenerational cruelty & obsession ?",
      "options": {
        "ক": "Jane Eyre",
        "খ": "Emma",
        "গ": "Wuthering Heights",
        "ঘ": "Persuasion"
      },
      "correct_answer": null
    },
    {
      "question_number": 71,
      "question_text": "মার্কিন যুক্তরাষ্ট্রের নেতৃত্বাধীন 'অ্যাকাস' (AUKUS) চুক্তির প্রাথমিক লক্ষ্য কী?",
      "options": {
        "ক": "অর্থনৈতিক সহযোগিতা",
        "খ": "সামরিক সহযোগিতা",
        "গ": "পরিবেশ সুরক্ষা",
        "ঘ": "মহাকাশ গবেষণা সহযোগিতা"
      },
      "correct_answer": null
    },
    {
      "question_number": 72,
      "question_text": "কোন্ গুচ্ছের সবগুলো বানানই শুদ্ধ?",
      "options": {
        "ক": "সারণী, নিরীহ, নীরোগ",
        "খ": "প্রমাণ, অঙ্গন, দর্পণ",
        "গ": "অনাথা, সুকণ্ঠী, অনূঢ়া",
        "ঘ": "একত্রিত, স্থায়িত্ব, অর্ধাঙ্গিনী"
      },
      "correct_answer": null
    },
    {
      "question_number": 73,
      "question_text": "অপারেশন ‘ _____ ’ লোহিত সাগরে হুতি (Houthi) হামলার জবাবে মার্কিন নেতৃত্বাধীন সামুদ্রিক নিরাপত্তা উদ্যোগ।",
      "options": {
        "ক": "ডেজার্ট স্টর্ম",
        "খ": "এন্ডুরিং ফ্রিডম",
        "গ": "ব্লু হেলমেট",
        "ঘ": "প্রসপারিটি গার্ডিয়ান"
      },
      "correct_answer": null
    },
    {
      "question_number": 74,
      "question_text": "'You will need a variety of skills, including leadership, endurance etc.' In this sentence the word 'including' is a –",
      "options": {
        "ক": "conjunction",
        "খ": "gerund",
        "গ": "participle",
        "ঘ": "preposition"
      },
      "correct_answer": null
    },
    {
      "question_number": 75,
      "question_text": "বাংলা পুঁথি সাহিত্যের উদাহরণ কোনটি?",
      "options": {
        "ক": "নূরনামা",
        "খ": "আমীর হামজা",
        "গ": "গোপিচন্দ্রের সন্ন্যাস",
        "ঘ": "মহুয়া"
      },
      "correct_answer": null
    },
    {
      "question_number": 76,
      "question_text": "GHz কিসের একক?",
      "options": {
        "ক": "মেমরির আকার",
        "খ": "প্রসেসরের গতি",
        "গ": "তথ্য স্থানান্তরের গতি",
        "ঘ": "তথ্য উৎপাদনের পরিমাণ"
      },
      "correct_answer": null
    },
    {
      "question_number": 77,
      "question_text": "'আকাশ ও পৃথিবীর অন্তরাল'-এক কথায় প্রকাশ করলে সঠিক উত্তর কী হবে?",
      "options": {
        "ক": "স্ফুলিঙ্গ",
        "খ": "ক্রন্দসী",
        "গ": "পীতাভ",
        "ঘ": "আরক্ত"
      },
      "correct_answer": null
    },
    {
      "question_number": 78,
      "question_text": "কোন্ আদালতের সিদ্ধান্তের বিরুদ্ধে আপীল করা যায় না?",
      "options": {
        "ক": "অর্থ ঋণ আদালত",
        "খ": "আন্তর্জাতিক অপরাধ ট্রাইবুনাল",
        "গ": "সামরিক আদালত",
        "ঘ": "সুপ্রীম কোর্টের হাইকোর্ট ডিভিশন"
      },
      "correct_answer": null
    },
    {
      "question_number": 79,
      "question_text": "ময়মনসিংহ গীতিকা কতটি ভাষায় অনূদিত হয়েছে?",
      "options": {
        "ক": "২৩টি",
        "খ": "২০টি",
        "গ": "২২টি",
        "ঘ": "২৫টি"
      },
      "correct_answer": null
    },
    {
      "question_number": 80,
      "question_text": "আন্তর্জাতিক নিরাপত্তা আলোচনায় নিচের কোন্ সাইবার হুমকিটি ক্রমবর্ধমানভাবে তাৎপর্যপূর্ণ হয়ে উঠেছে?",
      "options": {
        "ক": "ফিশিং (Phishing)",
        "খ": "স্প্যাম ইমেইল (Spam e-mail)",
        "গ": "র‍্যানসমওয়ার অ্যাটাক (Ransomware Attack)",
        "ঘ": "পরিচয় চুরি (Identity Theft)"
      },
      "correct_answer": null
    },
    {
      "question_number": 81,
      "question_text": "কোন্ কবি 'মজলুম আদিব' ছদ্মনামে কবিতা লিখতেন?",
      "options": {
        "ক": "আল মাহমুদ",
        "খ": "হেলাল হাফিজ",
        "গ": "নির্মলেন্দু গুণ",
        "ঘ": "শামসুর রাহমান"
      },
      "correct_answer": null
    },
    {
      "question_number": 82,
      "question_text": "কোনটি UNESCO 'Intangible Cultural Heritage'-এর অন্তর্ভুক্ত?",
      "options": {
        "ক": "একুশে ফেব্রুয়ারি",
        "খ": "পহেলা বৈশাখ",
        "গ": "বাউল গান",
        "ঘ": "জামদানি বয়ন শিল্প"
      },
      "correct_answer": null
    },
    {
      "question_number": 83,
      "question_text": "যদি x + 1/x = 0 হয়, তবে √x + 1/√x এর মান কত?",
      "options": {
        "ক": "0",
        "খ": "1",
        "গ": "√2",
        "ঘ": "2"
      },
      "correct_answer": null
    },
    {
      "question_number": 84,
      "question_text": "বাংলাদেশের উচ্চফলনশীল (উফশী) জাতের ধান ও গমের নাম যথাক্রমে-",
      "options": {
        "ক": "হরিধান, রূপালী",
        "খ": "ইরাটম, বর্ণালী",
        "গ": "ব্রি-শাইল, বলাকা",
        "ঘ": "হীরা, উত্তরণ"
      },
      "correct_answer": null
    },
    {
      "question_number": 85,
      "question_text": "বাংলাদেশে স্থানীয় সরকার ব্যবস্থা দুর্বল হওয়ার পেছনে সবচেয়ে বড় প্রাতিষ্ঠানিক দ্বন্দ্ব কোনটি?",
      "options": {
        "ক": "উপজেলা ও ইউনিয়ন পরিষদের মধ্যে দ্বৈত প্রশাসনিক কর্তৃত্ব",
        "খ": "সংবিধানে আর্থিক ক্ষমতার বিকেন্দ্রীকরণের বিধান থাকা সত্ত্বেও বাস্তবে তা কেন্দ্রীয় সরকারের হাতে অতিকেন্দ্রীভূত",
        "গ": "পৌরসভা পর্যায়ে সরকারি-বেসরকারি অংশীদারিত্বের অভাব",
        "ঘ": "দাতা সংস্থাগুলোর মধ্যে সমন্বয়হীনতা"
      },
      "correct_answer": null
    },
    {
      "question_number": 86,
      "question_text": "একটি কঠিন ঘনক অর্ধেক পানির উপরে ও অর্ধেক পানির নিচে ভাসছে। আপনি যদি ঘনকটি পানির মধ্যে ২ সে.মি. গভীরে ঠেলে দেন এবং তারপর সেটিকে ছেড়ে দেন, তাহলে কি ঘটবে?",
      "options": {
        "ক": "ঘনকটি পানির ২ সে.মি. গভীরে থাকবে",
        "খ": "ঘনকটি সম্পূর্ণভাবে ডুবে যাবে",
        "গ": "ঘনকটি আবার অর্ধেক ডুবে থাকা ও অর্ধেক ভেসে থাকা অবস্থায় ফিরে আসবে",
        "ঘ": "ঘনকটি প্রথমে যতটুকু ভেসে ছিল তার চেয়ে উপরে উঠবে"
      },
      "correct_answer": null
    },
    {
      "question_number": 87,
      "question_text": "'মা তাঁর সন্তানদের ভালোবাসেন'- এটি কোন্ ধরণের বাক্য?",
      "options": {
        "ক": "ইচ্ছাসূচক",
        "খ": "অনুজ্ঞাসূচক",
        "গ": "প্রশ্নবোধক",
        "ঘ": "ইতিবাচক"
      },
      "correct_answer": null
    },
    {
      "question_number": 88,
      "question_text": "'ময়দান, মুনাফা, বই' শব্দ তিনটি কোন্ ভাষা থেকে আগত?",
      "options": {
        "ক": "উর্দু",
        "খ": "ফারসি",
        "গ": "আরবি",
        "ঘ": "পর্তুগীজ"
      },
      "correct_answer": null
    },
    {
      "question_number": 89,
      "question_text": "বায়ুমণ্ডল ও মহাশূন্যের মধ্যবর্তী রেখাটির নাম কী?",
      "options": {
        "ক": "বিষুবরেখা",
        "খ": "ট্রপোপজ",
        "গ": "কারমান লাইন",
        "ঘ": "কলোরাডো লাইন"
      },
      "correct_answer": null
    },
    {
      "question_number": 90,
      "question_text": "ভঙ্গিল পর্বত, আগ্নেয় পর্বত ও স্তূপ পর্বতের উদাহরণ যথাক্রমে-",
      "options": {
        "ক": "রকি, ভিসুভিয়াস, ব্ল্যাক ফরেস্ট",
        "খ": "হিমালয়, আল্পস, রকি",
        "গ": "হিমালয়, রকি, বিন্ধ্যা",
        "ঘ": "আল্পস, হেনরী, ফুজিয়ামা"
      },
      "correct_answer": null
    },
    {
      "question_number": 91,
      "question_text": "মুনাফার হার কত হলে কিছু পরিমাণ টাকা চক্রবৃদ্ধি হারে 10 বছরে দ্বিগুণ হবে:",
      "options": {
        "ক": "5.17%",
        "খ": "6.17%",
        "গ": "7.17%",
        "ঘ": "8.17%"
      },
      "correct_answer": null
    },
    {
      "question_number": 92,
      "question_text": "পরমাণু চুল্লীতে সচরাচর কোন্ জ্বালানী ব্যবহার করা হয়?",
      "options": {
        "ক": "ইউরেনিয়াম-২৩৫",
        "খ": "ইউরেনিয়াম-২৩৮",
        "গ": "থোরিয়াম-১৩২",
        "ঘ": "প্লুটোনিয়াম-২৪০"
      },
      "correct_answer": null
    },
    {
      "question_number": 93,
      "question_text": "মার্কিন যুক্তরাষ্ট্র কত সালে রাশিয়ার কাছ থেকে আলাস্কা ক্রয় করেছিল?",
      "options": {
        "ক": "১৮৪৬",
        "খ": "১৮৬৭",
        "গ": "১৮৯৮",
        "ঘ": "১৯০৫"
      },
      "correct_answer": null
    },
    {
      "question_number": 94,
      "question_text": "'ই' এর মাত্রার উপরের অংশের নাম কী?",
      "options": {
        "ক": "চৈতন",
        "খ": "আঁকড়ি",
        "গ": "পাগড়ি",
        "ঘ": "জোড় আঁকড়ি"
      },
      "correct_answer": null
    },
    {
      "question_number": 95,
      "question_text": "চীনের উদ্যোগে চালু করা 'বেল্ট অ্যাান্ড রোড ইনিশিয়েটিভ' (BRI)-এর প্রাথমিক লক্ষ্য কী?",
      "options": {
        "ক": "একটি নতুন আন্তর্জাতিক মুদ্রা প্রতিষ্ঠা করা",
        "খ": "নৌ ঘাঁটির মাধ্যমে বিশ্বব্যাাপী অর্থনৈতিক সম্প্রসারণ",
        "গ": "বিশ্বব্যাাপী অর্থনৈতিক উন্নয়নে অর্থায়ন",
        "ঘ": "বাণিজ্য এবং অবকাঠামোর একটি বিশ্বব্যাাপী নেটওয়ার্ক তৈরি করা"
      },
      "correct_answer": null
    },
    {
      "question_number": 96,
      "question_text": "Transmission Control Protocol (TCP) OSI রেফারেন্স মডেলের কোন্ লেয়ারের প্রোটোকল?",
      "options": {
        "ক": "অ্যাপ্লিকেশন লেয়ার",
        "খ": "নেটওয়ার্ক লেয়ার",
        "গ": "ট্রান্সপোর্ট লেয়ার",
        "ঘ": "ডেটালিঙ্ক লেয়ার"
      },
      "correct_answer": null
    },
    {
      "question_number": 97,
      "question_text": "In William Shakespeare's play As You Like It, the Seven Ages of Man speech was delivered by-",
      "options": {
        "ক": "Oliver",
        "খ": "Orlando",
        "গ": "Jaques",
        "ঘ": "Rosalind"
      },
      "correct_answer": null
    },
    {
      "question_number": 98,
      "question_text": "জেমস ওয়েব স্পেস টেলিস্কোপ (JWST) মূলতঃ তড়িৎ-চুম্বকীয় বর্ণালীর কোন অংশে মহাবিশ্ব পর্যবেক্ষণ করার জন্য ডিজাইন করা হয়েছে?",
      "options": {
        "ক": "অবলোহিত অঞ্চল",
        "খ": "দৃশ্যমান এবং নিকট-অবলোহিত অঞ্চল",
        "গ": "অতিবেগুনী এবং দৃশ্যমান অঞ্চল",
        "ঘ": "এক্স-রে এবং গামা-রে অঞ্চল"
      },
      "correct_answer": null
    },
    {
      "question_number": 99,
      "question_text": "Identify the sentence where 'up' functions as a noun-",
      "options": {
        "ক": "He turned the volume up.",
        "খ": "Business confidence is on the up.",
        "গ": "We live just up the road.",
        "ঘ": "Our system should be up by afternoon."
      },
      "correct_answer": null
    },
    {
      "question_number": 100,
      "question_text": "বাংলাদেশের উন্নয়ন ধারার সবচেয়ে বড় কাঠামোগত বৈপরীত্য কোনটি?",
      "options": {
        "ক": "জনসংখ্যা বৃদ্ধির স্থবিরতা",
        "খ": "শক্তিশালী সামষ্টিক অর্থনৈতিক সূচকের পাশাপাশি দুর্বল প্রাতিষ্ঠানিক শাসনব্যবস্থা",
        "গ": "রেমিট্যান্স বৃদ্ধি কিন্তু শ্রম অভিবাসন হ্রাস",
        "ঘ": "রপ্তানি বৃদ্ধি কিন্তু শিল্পায়ন কমে যাওয়া"
      },
      "correct_answer": null
    },
    {
      "question_number": 101,
      "question_text": "কোনটি মাইক্রোওয়েভ ওভেনের কার্যনীতিকে সর্বোত্তমভাবে বর্ণনা করতে পারে?",
      "options": {
        "ক": "উচ্চ তাপ বিকিরণ এবং খাদ্য কণাগুলিতে পরিবহন",
        "খ": "খাদ্য কণাগুলিতে ইনফ্রা-রেড বিকিরণ এবং শোষণ",
        "গ": "পানির অণুগুলির ইন্ডাকশন হিটিং",
        "ঘ": "ঘূর্ণনের কারণে ডাই-ইলেকট্রিক হিটিং"
      },
      "correct_answer": null
    },
    {
      "question_number": 102,
      "question_text": "দুর্যোগ ব্যবস্থাপনার প্রথম ধাপ কোনটি?",
      "options": {
        "ক": "উদ্ধার",
        "খ": "পুনর্বাসন",
        "গ": "পুনর্গঠন",
        "ঘ": "প্রস্তুতি"
      },
      "correct_answer": null
    },
    {
      "question_number": 103,
      "question_text": "Which one is a coordinating conjunction?",
      "options": {
        "ক": "since",
        "খ": "lest",
        "গ": "as",
        "ঘ": "so"
      },
      "correct_answer": null
    },
    {
      "question_number": 104,
      "question_text": "ABSCISSA শব্দটির বর্নগুলিকে নিয়ে কত প্রকারে বিন্যাস করা যায়?",
      "options": {
        "ক": "10080",
        "খ": "6720",
        "গ": "3360",
        "ঘ": "3359"
      },
      "correct_answer": null
    },
    {
      "question_number": 105,
      "question_text": "একটি ত্রিভুজের তিনটি কোণের পরিমাণ x, 2x/3 ও 3x/2 । ক্ষুদ্রতম কোণের মান রেডিয়ানে কত হবে?",
      "options": {
        "ক": "π/6",
        "খ": "π/3",
        "গ": "π/2",
        "ঘ": "2π/3"
      },
      "correct_answer": null
    },
    {
      "question_number": 106,
      "question_text": "যদি 0 < x < 1 হয়, তবে নিচের কোনটি সবচেয়ে বড় হবে?",
      "options": {
        "ক": "x",
        "খ": "2x",
        "গ": "x^2",
        "ঘ": "x + 1"
      },
      "correct_answer": null
    },
    {
      "question_number": 107,
      "question_text": "আপনার পারসোনাল কম্পিউটারে (পিসি) কোন একটি প্রোগ্রাম এর কর্মদক্ষতা (performance) বৃদ্ধির জন্য কোন্ কাজটি করা সর্বোত্তম হবে বলে আপনি মনে করেন?",
      "options": {
        "ক": "প্রোগ্রামটির জন্য এমন একটা অ্যালগরিদম তৈরি করা যা asymptotically faster",
        "খ": "পিসির Configuration উন্নত করা",
        "গ": "খুব দ্রুত গতির I/O devices লাগানো",
        "ঘ": "খ এবং গ উভয়েই"
      },
      "correct_answer": null
    },
    {
      "question_number": 108,
      "question_text": "3 + 3/2 + 3/4 + . . . . + 3/64 ধারাটিতে মোট কতটি পদ আছে?",
      "options": {
        "ক": "5",
        "খ": "6",
        "গ": "7",
        "ঘ": "8"
      },
      "correct_answer": null
    },
    {
      "question_number": 109,
      "question_text": "x2 −(p + q) x + pq = 0 এর সমাধান সেট হবে:",
      "options": {
        "ক": "{p,q}",
        "খ": "{p,-q}",
        "গ": "{- p, q}",
        "ঘ": "{-p,-q}"
      },
      "correct_answer": null
    },
    {
      "question_number": 110,
      "question_text": "কোনটির দেহে নিউি য়াস ও সাইটোপ্লাাজম নেই?",
      "options": {
        "ক": "শৈবাল",
        "খ": "ছত্রাক",
        "গ": "ভাইরাস",
        "ঘ": "ব্যাাকটেরিয়া"
      },
      "correct_answer": null
    },
    {
      "question_number": 111,
      "question_text": "সাংস্কৃতিক মূল্যবোধগুলো বেশি উদ্ভুত হয় 'সামাজিক ____' থেকে।",
      "options": {
        "ক": "আচরণ",
        "খ": "বৈষম্য",
        "গ": "প্রথা",
        "ঘ": "নীতি"
      },
      "correct_answer": null
    },
    {
      "question_number": 112,
      "question_text": "কোন্ দুটি দেশ সম্প্রতি ন্যাাটোতে (NATO) যোগদান করেছে, যা ইউরোপের নিরাপত্তা পরিিতিকে নতুন রূপ প্রদান করেছে?",
      "options": {
        "ক": "অে লিয়া এবং সুইজারল্যাান্ড",
        "খ": "ইউক্রে ন এবং জর্ জিয়া",
        "গ": "সুইডেন এবং ফিনল্যাান্ড",
        "ঘ": "মলদোভা এবং বেলারুশ"
      },
      "correct_answer": null
    },
    {
      "question_number": 113,
      "question_text": "পারস্য উপসাগর থেকে জ্বাালানী তেলের প্রবাহ রক্ষায় মার্কিন যুক্তরাষ্ট্র তাদের ' _____ ডকট্রিন' অনুসরণ করে?",
      "options": {
        "ক": "মনরো",
        "খ": "ট্রুম্যাান",
        "গ": "বুশ",
        "ঘ": "কার্টার"
      },
      "correct_answer": null
    },
    {
      "question_number": 114,
      "question_text": "কাগজের প্রধান রাসায়নিক উপাদান কোনটি?",
      "options": {
        "ক": "লিগনিন",
        "খ": "রেজিন",
        "গ": "হেমি সেলুলোজ",
        "ঘ": "সেলুলোজ"
      },
      "correct_answer": null
    },
    {
      "question_number": 115,
      "question_text": "ভাইরাস সম্পর্কে কোন্ বিবৃতিটি সঠিক?",
      "options": {
        "ক": "এদের যেকোনো সিনথেটিক নিউট্রিয়েন্ট মিডিয়ামে কালচার করা যায়",
        "খ": "এদের জেনেটিক উপাদান হিসেবে ডিএনএ এবং আরএনএ থাকে",
        "গ": "এরা এক ধরণের অন্তঃকোষীয় পরজীবী",
        "ঘ": "ভাইরাস হল অণুবীক্ষণিক জীবন্ত প্রাণী"
      },
      "correct_answer": null
    },
    {
      "question_number": 116,
      "question_text": "Candidates are required to get _____ the centre before 09:00 AM.",
      "options": {
        "ক": "at",
        "খ": "to",
        "গ": "in",
        "ঘ": "into"
      },
      "correct_answer": null
    },
    {
      "question_number": 117,
      "question_text": "কোন্ জলবায়ুু চুি র অধীনে 'সবুজ জলবায়ুু তহবিল' বা Green Climate Fund প্রতিষ্ঠা করা হয়েছিল?",
      "options": {
        "ক": "ক্যাানকুন চুি",
        "খ": "প্যাারিস চুি",
        "গ": "কিয়োটো প্রো টোকল",
        "ঘ": "কোপেনহেগেন চুি"
      },
      "correct_answer": null
    },
    {
      "question_number": 118,
      "question_text": "OCR _____ থেকে ______ এ রূপান্তরের জন্য ব্যবহার করা হয়।",
      "options": {
        "ক": "অডিও হতে টেক্সট",
        "খ": "ইমেজ হতে টেক্সট",
        "গ": "ভিডিও হতে টেক্সট",
        "ঘ": "বাইনারি হতে ডেসিমেল"
      },
      "correct_answer": null
    },
    {
      "question_number": 119,
      "question_text": "'To have a shot' means:",
      "options": {
        "ক": "to open fire",
        "খ": "to take a photograph",
        "গ": "to make a try",
        "ঘ": "to test a gun"
      },
      "correct_answer": null
    },
    {
      "question_number": 120,
      "question_text": "একটি সমবাহু ত্রিভুজের বাহুর দৈর্ঘ্য 8 মিটার হলে এর ক্ষে ত্রফল হবে:",
      "options": {
        "ক": "8√3",
        "খ": "8√5",
        "গ": "16√3",
        "ঘ": "16√5"
      },
      "correct_answer": null
    },
    {
      "question_number": 121,
      "question_text": "কোনটি মানুষকে লক্ষ্যবস্তুর দিকে পরিচালিত করে?",
      "options": {
        "ক": "প্রয়োজন",
        "খ": "প্রেষণা",
        "গ": "ইচ্ছা",
        "ঘ": "শারীরিক শি"
      },
      "correct_answer": null
    },
    {
      "question_number": 122,
      "question_text": "Which functions both as a transitive and an intransitive verb?",
      "options": {
        "ক": "sleep",
        "খ": "arrive",
        "গ": "break",
        "ঘ": "die"
      },
      "correct_answer": null
    },
    {
      "question_number": 123,
      "question_text": "বাংলাদেশের মধ্যম আয়ের ফাঁদে (Middle-Income Trap) পড়ার ঝুঁকি মূলত কোন্ কাঠামোগত প্রতিবন্ধকতার সে যুক্ত?",
      "options": {
        "ক": "কৃষি রপ্তানি হ্রাাস",
        "খ": "নগর জনসংখ্যাার উচ্চ ঘনত্ব",
        "গ": "প্রবাসী আয়ের ওপর নির্ভরতা বৃি",
        "ঘ": "পুঁজি বৃি সেও মোট উৎপাদনশীলতার (Total Factor Productivity) বৃি ধীর গতির হওয়া"
      },
      "correct_answer": null
    },
    {
      "question_number": 124,
      "question_text": "A synonym of the word 'crepuscular' is-",
      "options": {
        "ক": "nocturnal",
        "খ": "diurnal",
        "গ": "cathemeral",
        "ঘ": "twilit"
      },
      "correct_answer": null
    },
    {
      "question_number": 125,
      "question_text": "সুশাসন কোন্ বিষয়টির প্রতিশ্রুতি দেয়?",
      "options": {
        "ক": "শুধুমাত্র কঠোর আইন প্রয়োগের",
        "খ": "রাজনৈতিক প্রাধান্য ও প্রশাসনিক নিয়ন্ত্রনের",
        "গ": "সংস্কাার ছাড়া ঐতিহ্য সংরক্ষণের",
        "ঘ": "স্বচ্ছতা, জবাবদিহিতা ও নৈতিক নেতৃের"
      },
      "correct_answer": null
    },
    {
      "question_number": 126,
      "question_text": "বাংলাদেশের বাইরে প্রথম শহীদ মিনার স্থাাপিত হয় _____ ।",
      "options": {
        "ক": "যুক্তরাজ্ যে",
        "খ": "যুক্তরাে",
        "গ": "ভারতে",
        "ঘ": "পাকিস্তানে"
      },
      "correct_answer": null
    },
    {
      "question_number": 127,
      "question_text": "কোন্ বাংগালি বিজ্ঞাানী কৃষ্ণগহ্বর নিয়ে গবেষনা করেছেন?",
      "options": {
        "ক": "ড. কুদরত-ই-খুদা",
        "খ": "কাজী মোতাহার হোসেন",
        "গ": "জামাল নজরুল ইসলাম",
        "ঘ": "অতীশ দীপংকর"
      },
      "correct_answer": null
    },
    {
      "question_number": 128,
      "question_text": "তারাশঙ্কর বন্দ্যোপাধ্যাায়ের 'কবি' গ্রন্থটিতে কোন বিষয়টি প্রাধান্য পেয়েছে?",
      "options": {
        "ক": "অসম ভালোবাসা",
        "খ": "আদিবাসীদের জীবন চিত্র",
        "গ": "ডোম সম্প্রদায়ের জীবন কাহিনী",
        "ঘ": "পঞ্চাশের মন্বন্তর"
      },
      "correct_answer": null
    },
    {
      "question_number": 129,
      "question_text": "বাংলাদেশে রপ্তানী আয়ের প্রধান উৎস কোনটি?",
      "options": {
        "ক": "জনশক্তি রপ্তানী",
        "খ": "তৈরি পোশাক রপ্তানী",
        "গ": "জাতিসংঘ শান্তি মিশনে শান্তিরক্ষী প্রেরণ",
        "ঘ": "চামড়া জাতীয় পণ্য রপ্তানী"
      },
      "correct_answer": null
    },
    {
      "question_number": 130,
      "question_text": "কোন্ সংস্থাা বাংলাদেশের GDP হিসাব করে?",
      "options": {
        "ক": "বাংলাদেশ পরিসংখ্যাান ব্যুরো",
        "খ": "বাংলাদেশ ব্যাংক",
        "গ": "অর্থ বিভাগ",
        "ঘ": "বাংলাদেশ পরিকল্পনা কমিশন"
      },
      "correct_answer": null
    },
    {
      "question_number": 131,
      "question_text": "2x2 + 3x + 1 এর ক্ষুদ্রতম মান হবে:",
      "options": {
        "ক": "-3/8",
        "খ": "-1/8",
        "গ": "1/8",
        "ঘ": "3/4"
      },
      "correct_answer": null
    },
    {
      "question_number": 132,
      "question_text": "কিশোর পত্রিকা 'বালক' প্রতিষ্ঠা কার অমর কীর্তি?",
      "options": {
        "ক": "স্বর্ণকুমারী দেবী",
        "খ": "সেলিনা হোসেন",
        "গ": "আল মাহমুদ",
        "ঘ": "কাদম্বরী দেবী"
      },
      "correct_answer": null
    },
    {
      "question_number": 133,
      "question_text": "কোনটি ই-কমার্সের প্লাাটফর্ম হিসাবে কাজ করতে পারে?",
      "options": {
        "ক": "Facebook",
        "খ": "Amazon",
        "গ": "YouTube",
        "ঘ": "All of the above"
      },
      "correct_answer": null
    },
    {
      "question_number": 134,
      "question_text": "A very large building in which aircraft are housed is called a/an-",
      "options": {
        "ক": "terminal",
        "খ": "aerodrome",
        "গ": "hanger",
        "ঘ": "hangar"
      },
      "correct_answer": null
    },
    {
      "question_number": 135,
      "question_text": "বস্তুর ওজন পৃথিবীর কোন স্থাানে সবচেয়ে বেশি?",
      "options": {
        "ক": "মেরু অঞ্চল",
        "খ": "নিরক্ষীয় অঞ্চল",
        "গ": "একটি পাহাড়ের চূড়াায়",
        "ঘ": "পৃথিবীর কেন্দ্রে"
      },
      "correct_answer": null
    },
    {
      "question_number": 136,
      "question_text": "এখন জানুয়ারী মাস হলে এখন থেকে ১০০ মাস পর কোন্ মাস হবে?",
      "options": {
        "ক": "মে",
        "খ": "মার্চ",
        "গ": "এপ্রিল",
        "ঘ": "ফেব্রুয়ারী"
      },
      "correct_answer": null
    },
    {
      "question_number": 137,
      "question_text": "শাসন ব্যবস্থাায় মূল্যবোধ প্রাতিষ্ঠানিক করার সবচেয়ে কার্যকর কৌশল কোনটি?",
      "options": {
        "ক": "ঘন ঘন আইনের সংস্কাার",
        "খ": "নিয়মিত বেতন বৃদ্ধি",
        "গ": "নৈতিক শিক্ষা ও প্রাতিষ্ঠাানিক শিক্ষার সমন্নয়",
        "ঘ": "আমলাতান্ত্রিক নিয়ন্ত্রণ বৃদ্ধি"
      },
      "correct_answer": null
    },
    {
      "question_number": 138,
      "question_text": "Identify the incorrect spelling:",
      "options": {
        "ক": "diletante",
        "খ": "homonym",
        "গ": "cromulent",
        "ঘ": "accubation"
      },
      "correct_answer": null
    },
    {
      "question_number": 139,
      "question_text": "0x1234 সংখ্যাার বাইনারিরূপ কোনটি?",
      "options": {
        "ক": "001010011100",
        "খ": "0010010010100",
        "গ": "1110101111001011",
        "ঘ": "0001001000110100"
      },
      "correct_answer": null
    },
    {
      "question_number": 140,
      "question_text": "'বিষণ্ণ' শব্দটির সঠিক বিশেষ্য রূপ কোনটি?",
      "options": {
        "ক": "বিষাদ",
        "খ": "বিষণ্ণ",
        "গ": "বিষাক্ত",
        "ঘ": "বিষয়"
      },
      "correct_answer": null
    },
    {
      "question_number": 141,
      "question_text": "কোনটি বাউল গানের বৈশিষ্ট্য?",
      "options": {
        "ক": "বীরত্বগাথা ও ভক্তি মূলক",
        "খ": "মানবিক আবেগ ও দৈনন্দিন জীবন",
        "গ": "আধ্যাত্মিক প্রেম ও অন্তর্গত অনুসন্ধান",
        "ঘ": "পল্লী জীবনের সুখ দুঃখ"
      },
      "correct_answer": null
    },
    {
      "question_number": 142,
      "question_text": "ক্লাাউড কম্পিউটিং কোন পরিষেবা প্রদান করে?",
      "options": {
        "ক": "শুধুমাত্র লোকাল স্টোরেজ",
        "খ": "ভার্চুয়াল কম্পিউটিং রিসোর্সেস",
        "গ": "শুধুমাত্র ভার্চুয়াল স্টোরেজ",
        "ঘ": "উপরের সবগুলো"
      },
      "correct_answer": null
    },
    {
      "question_number": 143,
      "question_text": "'কোভিড-১৯'-এর জন্য তৈরি টিকা কীভাবে কাজ করে?",
      "options": {
        "ক": "রোগ প্রতিরোধ ক্ষমতা উদ্দীপিত করার জন্য দুর্বল ভাইরাসের একটি রূপ প্রবর্তন করে",
        "খ": "পরিশোধিত ভাইরাল প্রোটিনের সাবইউনিট প্রবিষ্ট করানোর মাধ্যমে",
        "গ": "হোস্ট কোষে জেনেটিক উপাদান বহন করার জন্য একটি ভাইরাস ঘটিত বাহক ব্যবহার করে",
        "ঘ": "mRNA সরবরাহ করে যা হোস্ট কোষ গুলোকে একটি ভাইরাল প্রোটিন তৈরির নির্দেশ দেয়"
      },
      "correct_answer": null
    },
    {
      "question_number": 144,
      "question_text": "'Poetry is the spontaneous overflow of powerful feeling: it takes its origin from emotion recollected in tranquility' is a statement ascribed to-",
      "options": {
        "ক": "Coleridge",
        "খ": "William Wordsworth",
        "গ": "TS Eliot",
        "ঘ": "IA Richards"
      },
      "correct_answer": null
    },
    {
      "question_number": 145,
      "question_text": "In which of these poems did Matthew Arnold express a pessimistic worldview, reflecting on a world full of conflicts and lacking in joy, evincing an implicit criticism of Victorian era's aggressive spirit?",
      "options": {
        "ক": "Scholar Gipsy",
        "খ": "Dover Beach",
        "গ": "Rugby Chapel",
        "ঘ": "Immortality"
      },
      "correct_answer": null
    },
    {
      "question_number": 146,
      "question_text": "কোন্ বাক্যটি প্রয়োগগত দিক থেকে শুদ্ধ?",
      "options": {
        "ক": "মাছ আকাশে উড়ে।",
        "খ": "তাঁর খুব আনন্দ পেল।",
        "গ": "আবশ্যক ব্যয়ে কার্পণ্য অনুচিত।",
        "ঘ": "সকল ছাত্রগণ পাঠে মনোযোগী।"
      },
      "correct_answer": null
    },
    {
      "question_number": 147,
      "question_text": "জসীমউদ্দীন এর 'কবর' কবিতাটি কোন্ পত্রিকায় প্রথম প্রকাশিত হয়?",
      "options": {
        "ক": "তত্ত্ব-বোধিনী",
        "খ": "ধূমকেতু",
        "গ": "কালি ও কলম",
        "ঘ": "কল্লোল"
      },
      "correct_answer": null
    },
    {
      "question_number": 148,
      "question_text": "K এর কোন মানের জন্য 5x+4y-1=0 এবং 2x+Ky-7=0 সরলরেখা দুটি সমান্তরাল?",
      "options": {
        "ক": "5/8",
        "খ": "8/5",
        "গ": "5/2",
        "ঘ": "-8/5"
      },
      "correct_answer": null
    },
    {
      "question_number": 149,
      "question_text": "প্রাচীন 'হরিকেল জনপদটি' কোন্ কোন্ বিভাগ সমন্বয়ে গঠিত?",
      "options": {
        "ক": "রাজশাহী ও রংপুর",
        "খ": "চট্টগ্রাম ও সিলেট",
        "গ": "রাজশাহী ও খুলনা",
        "ঘ": "খুলনা ও ঢাকা"
      },
      "correct_answer": null
    },
    {
      "question_number": 150,
      "question_text": "মিয়ানমারে পরিচালিত স্ক্যাম সেন্টারগুলো মোকাবিলায় সম্প্রতি কোন্ দেশ 'স্ক্যাম সেন্টার স্ট্রাইক ফোর্স' চালু করেছে?",
      "options": {
        "ক": "রাশিয়া",
        "খ": "চীন",
        "গ": "মার্কিন যুক্তরাষ্ট্র",
        "ঘ": "থাইল্যান্ড"
      },
      "correct_answer": null
    },
    {
      "question_number": 151,
      "question_text": "ডলারের বিপরীতে টাকার অবমূল্যায়নের অন্যতম প্রভাব কি?",
      "options": {
        "ক": "বিদেশে বিনিয়োগে উৎসাহ প্রদান",
        "খ": "তারল্য সংকট কাটিয়ে উঠা",
        "গ": "খেলাপী ঋণের পরিমান কমিয়ে আনা",
        "ঘ": "রপ্তানী বাড়ানো"
      },
      "correct_answer": null
    },
    {
      "question_number": 152,
      "question_text": "বাংলাদেশের সংবিধানের রক্ষাকর্তা কে?",
      "options": {
        "ক": "প্রধান বিচারপতি",
        "খ": "প্রধানমন্ত্রী",
        "গ": "সেনাবাহিনী প্রধান",
        "ঘ": "রাষ্ট্রপতি"
      },
      "correct_answer": null
    },
    {
      "question_number": 153,
      "question_text": "(x2 − 2 + 1/x2)^7 এর বিস্তৃতিতে মধ্যপদ কততম পদটি?",
      "options": {
        "ক": "পঞ্চম",
        "খ": "সপ্তম",
        "গ": "অষ্টম",
        "ঘ": "নবম"
      },
      "correct_answer": null
    },
    {
      "question_number": 154,
      "question_text": "এহসান টেবিলের উপর চায়ের কাপের হ্যান্ডলটি পূর্বদিকে করে রাখল। সে ঘড়ির কাঁটা যেদিকে ঘোরে সেদিকে চায়ের কাপটি ১৮০° ঘোরালো। এখন চায়ের কাপের হ্যান্ডলটি থাকবে:",
      "options": {
        "ক": "পশ্চিম দিকে",
        "খ": "দক্ষিণ দিকে",
        "গ": "উত্তর দিকে",
        "ঘ": "পূর্ব দিকে"
      },
      "correct_answer": null
    },
    {
      "question_number": 155,
      "question_text": "'পরমেশ' শব্দটির সঠিক সন্ধি বিচ্ছেদ কোনটি?",
      "options": {
        "ক": "পরম+এশ",
        "খ": "পরম+ ঈশ",
        "গ": "পরম+ ইশ",
        "ঘ": "পরম+ ইস"
      },
      "correct_answer": null
    },
    {
      "question_number": 156,
      "question_text": "কোনটি ব্রিকস (BRICS)-এর প্রধান লক্ষ্য?",
      "options": {
        "ক": "ন্যাটোর সম্প্রসারণে সহায়তা প্রদান",
        "খ": "বিশ্ব আর্থিক প্রতিষ্ঠানগুলোর সংস্কার পূর্বক উদীয়মান অর্থনৈতিক দেশগুলোর স্বার্থরক্ষা",
        "গ": "ইউরোপের জন্য একক মুদ্রা প্রতিষ্ঠা করা",
        "ঘ": "জি-৭ এর সদস্য সংখ্যা বৃদ্ধি"
      },
      "correct_answer": null
    },
    {
      "question_number": 157,
      "question_text": "প্রত্যয়ন বায়ু উত্তর গোলার্ধে _____ দিক থেকে _____ দিকে প্রবাহিত হয়?",
      "options": {
        "ক": "পূর্ব, পশ্চিম",
        "খ": "দক্ষিণপশ্চিম, উত্তরপূর্ব",
        "গ": "উত্তর, দক্ষিণ",
        "ঘ": "উত্তর, পশ্চিম"
      },
      "correct_answer": null
    },
    {
      "question_number": 158,
      "question_text": "গণতান্ত্রিক ব্যবস্থার ফলপ্রসূতার জন্য অগ্রাধিকার পাবে ____ ।",
      "options": {
        "ক": "আইনসমূহ",
        "খ": "টাকা",
        "গ": "গুণগত শিক্ষা",
        "ঘ": "অবকাঠামোগত সুবিধাসমূহ"
      },
      "correct_answer": null
    },
    {
      "question_number": 159,
      "question_text": "কোন্ বানানটি শুদ্ধ?",
      "options": {
        "ক": "নিশিথিনি",
        "খ": "কথোপকথন",
        "গ": "পিপিলিকা",
        "ঘ": "সমিচিন"
      },
      "correct_answer": null
    },
    {
      "question_number": 160,
      "question_text": "ডেটাবেস হল-",
      "options": {
        "ক": "তথ্য রাখার হার্ডওয়্যারসমূহ",
        "খ": "তথ্য রাখার প্রোগ্রামসমুহ",
        "গ": "তথ্যসমূহের সুসঙ্গঠিত রূপ",
        "ঘ": "তথ্য স্থানান্তরের জন্য ইন্টারনেট পরিষেবা।"
      },
      "correct_answer": null
    },
    {
      "question_number": 161,
      "question_text": "‘ ______ ’ জেলায় রেল যোগাযোগ নেই।",
      "options": {
        "ক": "জামালপুর",
        "খ": "পটুয়াখালী",
        "গ": "নাটোর",
        "ঘ": "নেত্রকোনা"
      },
      "correct_answer": null
    },
    {
      "question_number": 162,
      "question_text": "বিশ্বব্যাংক বর্ণিত সুশাসন সূচকে কোনো দেশের সূচক ০.০০ হলে, সে দেশের সু-শাসনের অবস্থা কি বলে পরিগনিত হবে?",
      "options": {
        "ক": "নিচু মানের",
        "খ": "উচু মানের",
        "গ": "মাঝারি মানের",
        "ঘ": "কোনোটিই নয়"
      },
      "correct_answer": null
    },
    {
      "question_number": 163,
      "question_text": "What is the antonym of 'percipience'?",
      "options": {
        "ক": "shrewdness",
        "খ": "dullness",
        "গ": "discerning",
        "ঘ": "astuteness"
      },
      "correct_answer": null
    },
    {
      "question_number": 164,
      "question_text": "Which of these is not characteristic of English Romantic Poetry?",
      "options": {
        "ক": "Ordinary life",
        "খ": "Everyday language",
        "গ": "Expression of feelings rather than action or plot",
        "ঘ": "Inane and gaudy phraseology"
      },
      "correct_answer": null
    },
    {
      "question_number": 165,
      "question_text": "আধুনিক বাংলা নাটক মূলত কয়টি পর্বে বিভক্ত?",
      "options": {
        "ক": "৬টি",
        "খ": "৪টি",
        "গ": "৫টি",
        "ঘ": "৭টি"
      },
      "correct_answer": null
    },
    {
      "question_number": 166,
      "question_text": "সেট (2,3,4) এর প্রকৃত উপসেট কয়টি:",
      "options": {
        "ক": "3",
        "খ": "7",
        "গ": "8",
        "ঘ": "9"
      },
      "correct_answer": null
    },
    {
      "question_number": 167,
      "question_text": "বাংলাদেশের পদ্মা ও যমুনা নদীর শাখা নদীগুলো কোনগুলো?",
      "options": {
        "ক": "গড়াই ও মধুমতী",
        "খ": "মহানন্দা ও বংশী",
        "গ": "মহানন্দা ও আত্রাই",
        "ঘ": "গড়াই ও ধলেশ্বরী"
      },
      "correct_answer": null
    },
    {
      "question_number": 168,
      "question_text": "একটি NPN ট্রানজিস্টরে, প্রধান চার্জ বাহক হলো-",
      "options": {
        "ক": "হোল",
        "খ": "ইলেকট্রন",
        "গ": "প্রোটন",
        "ঘ": "আয়ন"
      },
      "correct_answer": null
    },
    {
      "question_number": 169,
      "question_text": "'গ্রে-হাইড্রোজেন'-এর তুলনায় 'গ্রীন-হাইড্রোজেনের' সুবিধা হল-",
      "options": {
        "ক": "এটি উৎপাদন করা সস্তা",
        "খ": "এতে কার্বন নিঃসরণ প্রায় শূন্য হয়",
        "গ": "এটি সংরক্ষণ এবং পরিবহন করা সহজ",
        "ঘ": "প্রতি একক আয়তনে এর শক্তি ঘনত্ব বেশি"
      },
      "correct_answer": null
    },
    {
      "question_number": 170,
      "question_text": "পুঁথি সাহিত্যে প্রাচীনতম লেখক কে?",
      "options": {
        "ক": "ভারত চন্দ্র রায়",
        "খ": "কাজী দৌলত",
        "গ": "আবদুল হাকিম",
        "ঘ": "ফকির গরীবুল্লাহ"
      },
      "correct_answer": null
    },
    {
      "question_number": 171,
      "question_text": "জীবনের তিনটি শ্রেষ্ঠ মূল্যবোধ কী কী?",
      "options": {
        "ক": "সম্পদ, ক্ষমতা ও সদগুন",
        "খ": "সত্য, আনন্দ ও সদগুন",
        "গ": "সত্য, সুন্দর ও সদগুন",
        "ঘ": "আনন্দ, বিবেক ও সাহস"
      },
      "correct_answer": null
    },
    {
      "question_number": 172,
      "question_text": "সংস্কার কমিশন নতুন সংস্কার প্রস্তাবে বাংলাদেশ সংসদের উচ্চ কক্ষে ______ টি আসন প্রস্তাব করে।",
      "options": {
        "ক": "২৫",
        "খ": "৫০",
        "গ": " ৭৫",
        "ঘ": "১০০"
      },
      "correct_answer": null
    },
    {
      "question_number": 173,
      "question_text": "কোনটি কাজী নজরুল ইসলামের প্রবন্ধ গ্রন্থ?",
      "options": {
        "ক": "মৃত্যুক্ষুধা",
        "খ": "সিন্ধু হিন্দোল",
        "গ": "যুগবাণী",
        "ঘ": "অিবীণা"
      },
      "correct_answer": null
    },
    {
      "question_number": 174,
      "question_text": "বাংলাদেশের সংবিধান কার্যকর হয়-",
      "options": {
        "ক": "১৬ ডিসেম্বর, ১৯৭১",
        "খ": "১৬ ডিসেম্বর, ১৯৭২",
        "গ": "২৬ মার্চ, ১৯৭২",
        "ঘ": "২৬ মার্চ, ১৯৭৩"
      },
      "correct_answer": null
    },
    {
      "question_number": 175,
      "question_text": "The saying 'Every cloud has its silver lining' means:",
      "options": {
        "ক": "bad weather is often replaced by good weather",
        "খ": "clouds often have shining surroundings",
        "গ": "every difficult situation has a more hopeful aspect though not apparent at the beginning",
        "ঘ": "clouds and sunshine go hand in hand"
      },
      "correct_answer": null
    },
    {
      "question_number": 176,
      "question_text": "কোন্ প্রাক্তন রাষ্ট্রপ্রধান প্রথম 'ইন্দো-প্যাসিফিক' (Indo-Pacific) শব্দটি জনপ্রিয় করেন?",
      "options": {
        "ক": "ডোনাল্ড ট্রাম্প",
        "খ": "শিনজো অ্যাবে",
        "গ": "বারাক ওবামা",
        "ঘ": "জর্জ ডিউ বুশ"
      },
      "correct_answer": null
    },
    {
      "question_number": 177,
      "question_text": "−1 + 1/2 − 1/4 + 1/8 − 1/16 + ... অসীম ধারাটির যোগফল হবে:",
      "options": {
        "ক": "-2/3",
        "খ": "-3/2",
        "গ": "2/3",
        "ঘ": "3/2"
      },
      "correct_answer": null
    },
    {
      "question_number": 178,
      "question_text": "যদি একটি গাড়ীর গতি দ্বিগুণ করা হয়, তবে গাড়ীটির গতিশক্তি পূর্বের গতিশক্তির কতগুণ হবে?",
      "options": {
        "ক": "০.৫",
        "খ": "২",
        "গ": "০.২৫",
        "ঘ": "৪"
      },
      "correct_answer": null
    },
    {
      "question_number": 179,
      "question_text": "লিথিয়াম-আয়ন ব্যাাটারির সম্পর্কে কোন্ বিবৃতিটি মিথ্যাা?",
      "options": {
        "ক": "Ni-Cd ব্যাাটারির তুলনায় এদের শি র ঘনত্ব বেশি",
        "খ": "'মেমরি এফেক্ট'-এর কারণে এদের পর্যায়ক্রমিক সম্পূর্ণ ডিসচার্ জের প্রয়োজন হয়",
        "গ": "এতে লিথিয়াম কোবাল্ট অক্সাইড ক্যাাথোড ব্যবহার করা হয়",
        "ঘ": "এখানে অতিরিক্ত চার্ জিং-এর ফলে আগুন লাগতে পারে"
      },
      "correct_answer": null
    },
    {
      "question_number": 180,
      "question_text": "জলবায়ুু পরিবর্তন সংক্রান্ত জাতিসংঘ ফ্রে মওয়ার্ক কনভেনশনের (UNFCCC) প্রথম কনফারেন্স অফ দ্য পাটিস (COP) কোন্ শহরে অনুিত হয়েছিল?",
      "options": {
        "ক": "কোপেনহেগেন",
        "খ": "প্যাারিস",
        "গ": "ওয়ারশ",
        "ঘ": "বন"
      },
      "correct_answer": null
    },
    {
      "question_number": 181,
      "question_text": "কোনটি সুশাসনের আদর্শকে সবচেয়ে ভালোভাবে প্রকাশ করে?",
      "options": {
        "ক": "এটি শুধুমাত্র পরিমাপযোগ্য ফলাফলের উপর নির্ভরশীল",
        "খ": "এটি মূল্যবোধ-নিরপেক্ষ",
        "গ": "এটি নৈতিক মানদন্ড ও জনস্বার্থ দ্বাারা পরিচালিত",
        "ঘ": "এটি কেবল অর্থনৈতিক প্রবৃিকে অগ্রাধিকার দেয়"
      },
      "correct_answer": null
    },
    {
      "question_number": 182,
      "question_text": "HTTPS কোন বৈশিষ্ট্য HTTP-এর সাথে যোগ করে?",
      "options": {
        "ক": "Security",
        "খ": "Standardization",
        "গ": "Software",
        "ঘ": "Sense"
      },
      "correct_answer": null
    },
    {
      "question_number": 183,
      "question_text": "কোন্ ভূ-রাজনৈতিক তত্ত্ব বিশ্ব আধিপত্যের চাবিকাঠি হিসাবে ইউরেশিয়ার নিয়ন্ত্রণকে সমর্থন করে?",
      "options": {
        "ক": "হার্টল্যাান্ড তত্ত্ব",
        "খ": "ডমিনো তত্ত্ব",
        "গ": "রিমল্যাান্ড তত্ত্ব",
        "ঘ": "কে ইনমেন্ট তত্ত্ব"
      },
      "correct_answer": null
    },
    {
      "question_number": 184,
      "question_text": "'Let me not to the marriage of true minds/Admit impediments; love is not love/Which alters when it alteration finds'. Lines taken from a sonnet by _____ .",
      "options": {
        "ক": "Spencer",
        "খ": "Petrarch",
        "গ": "Shakespeare",
        "ঘ": "Donne"
      },
      "correct_answer": null
    },
    {
      "question_number": 185,
      "question_text": "In Gulliver's Travels, which of these traits Swift does not show in his depiction of the land of the Lilliput?",
      "options": {
        "ক": "pride",
        "খ": "lies",
        "গ": "peace & wisdom",
        "ঘ": "silly rules"
      },
      "correct_answer": null
    },
    {
      "question_number": 186,
      "question_text": "Which play is filled with nonsensical conversations, meaningless dialogues, and characters who often become forgetful?",
      "options": {
        "ক": "Pygmalion",
        "খ": "The Skin Game",
        "গ": "Waiting for Godot",
        "ঘ": "Candida"
      },
      "correct_answer": null
    },
    {
      "question_number": 187,
      "question_text": "'এপিকালচার' কোন বিষয় নিয়ে আলোচনা করে?",
      "options": {
        "ক": "গুটিপোকা এবং রেশম",
        "খ": "মৌমাছি এবং মধু",
        "গ": "মৎস্য চাষ",
        "ঘ": "তামাক চাষ"
      },
      "correct_answer": null
    },
    {
      "question_number": 188,
      "question_text": "দুর্বল শাসন ব্যবস্থাায় উন্নয়ন প্রকল্প ব্যর্থ হয় কারন-",
      "options": {
        "ক": "সম্পদের অভাব",
        "খ": "নাগরিকের বিরোধিতা",
        "গ": "সিদ্ধান্ত গ্রহনে স্বচ্ছতা ও সততার অভাব",
        "ঘ": "প্রযুি র অভাব"
      },
      "correct_answer": null
    },
    {
      "question_number": 189,
      "question_text": "এভারেস্ট শৃের তিব্বতী ও চীনা নাম কী কী?",
      "options": {
        "ক": "দালাইলামা এবং চিংংলু",
        "খ": "চোমোলাংমা এবং কোমোলাংমা",
        "গ": "কোমোলাংমা এবং চিংংলু",
        "ঘ": "চোমোলাংমা এবং এলবার্গ"
      },
      "correct_answer": null
    },
    {
      "question_number": 190,
      "question_text": "'বিশ্ব বাণিজ্য সংস্থাা' (WTO) প্রতিিত হয়েছিল _____ চুি র মাধ্যমে।",
      "options": {
        "ক": "ব্রেটন উডস",
        "খ": "লিসবন",
        "গ": "জেনেভা",
        "ঘ": "মারাকেশ"
      },
      "correct_answer": null
    },
    {
      "question_number": 191,
      "question_text": "2, 3, 4 এবং 7 সংখ্যাাগুলির গড় বিচ্যুতি কত?",
      "options": {
        "ক": "2",
        "খ": "3",
        "গ": "3/2",
        "ঘ": "4"
      },
      "correct_answer": null
    },
    {
      "question_number": 192,
      "question_text": "'ফিকা কমলা রং'- এখানে ফিকা অর্থ কী?",
      "options": {
        "ক": "অনুজ্জ্বল",
        "খ": "উজ্জ্বল",
        "গ": "তীব্র",
        "ঘ": "ঝাঁঝালো"
      },
      "correct_answer": null
    },
    {
      "question_number": 193,
      "question_text": "একটি স্বরধ্বনির প্রভাবে শে অপর স্বরের পরিবর্তন ঘটলে তাকে বলে-",
      "options": {
        "ক": "অভিশ্রুতি",
        "খ": "অপিনিহিতি",
        "গ": "সমীভবন",
        "ঘ": "স্বরসঙ্গতি"
      },
      "correct_answer": null
    },
    {
      "question_number": 194,
      "question_text": "মোবাইল ফোন অপারেটররা কোন্ অ্যাালগরিদম ব্যবহার করে লোকেশন ট্র্যাাক করে?",
      "options": {
        "ক": "Shortest Path",
        "খ": "Triangulation",
        "গ": "Nearest-neighbour",
        "ঘ": "Encryption"
      },
      "correct_answer": null
    },
    {
      "question_number": 195,
      "question_text": "ঘূর্ণিঝড় 'সিডর' ও 'আইলা' বাংলাদেশে আঘাত হানে _____ এবং _____ সালে।",
      "options": {
        "ক": "২০০৭, ২০০৮",
        "খ": "২০০৮, ২০০৯",
        "গ": "২০০৭, ২০০৯",
        "ঘ": "২০০৭, ২০০৬"
      },
      "correct_answer": null
    },
    {
      "question_number": 196,
      "question_text": "40 থেকে 50 এর মধ্যে একটি সংখ্যাা দৈবভাবে নেয়া হলে এটি মৌলিক (Prime) হওয়ার সম্ভাাবনা কত?",
      "options": {
        "ক": "3/11",
        "খ": "1/2",
        "গ": "5/11",
        "ঘ": "4/11"
      },
      "correct_answer": null
    },
    {
      "question_number": 197,
      "question_text": "একটা 4-bit বাইনারি সিে মে শূণ্য এর 2's complement এর ডেসিম্যাাল মান কত হবে?",
      "options": {
        "ক": "১৬",
        "খ": "০",
        "গ": "১৫",
        "ঘ": "কোনটিই নয়"
      },
      "correct_answer": null
    },
    {
      "question_number": 198,
      "question_text": "কোন্ বিষয়টি মুদ্রাপাচারের অন্তর্ভুক্ত নয়?",
      "options": {
        "ক": "রপ্তানী পণ্যের অবমূল্যাায়ন",
        "খ": "আমদানী পণ্যের অধিক মূল্য নির্ধারণ",
        "গ": "আয়কর ফাঁকি দেয়া",
        "ঘ": "অবৈধ চ্যাানেলে বিদেশে টাকা পাঠানো"
      },
      "correct_answer": null
    },
    {
      "question_number": 199,
      "question_text": "পারমাণবিক চুিতে 'মডারেটরের প্রাথমিক কাজ হলো:",
      "options": {
        "ক": "অতিরিক্ত নিউট্রন শোষণ এবং চেইন বিক্রি য়া নিয়ন্ত্রণ",
        "খ": "চুির কেে উৎপন্ন তাপ স্থানান্তর করে শীতল করা",
        "গ": "দ্রুতগতি সম্পন্ন নিউট্রনগুলোকে ধীরগতি করে ফিশনের সম্ভাবনা বাড়ানো",
        "ঘ": "ক্ষতিকারক গামা বিকিরণ থেকে সুরক্ষা প্রদান"
      },
      "correct_answer": null
    },
    {
      "question_number": 200,
      "question_text": "জারিনের জন্ম ২৯ ফেব্রুয়ারী। তার জন্মগ্রহণের সাল কোনটি হতে পারে?",
      "options": {
        "ক": "২০০২",
        "খ": "২০০৪",
        "গ": "২০০৬",
        "ঘ": "২০১০"
      },
      "correct_answer": null
    }
  ]
} 


// ─── Types ──────────────────────────────────────────────────
type TabKey = 'documents' | 'scraper';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ─── Tabs ────────────────────────────────────────────────────
const TABS: TabConfig[] = [
  {
    key: 'documents',
    label: 'Document Upload',
    icon: <Upload size={18} />,
    description: 'Upload documents (PDF, DOC, TXT) for RAG ingestion',
  },
  {
    key: 'scraper',
    label: 'Question Scraper',
    icon: <FileSearch size={18} />,
    description: 'Upload question papers (PDF) to extract questions',
  },
];

// ─── Status Toast ────────────────────────────────────────────
function StatusToast({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border backdrop-blur-sm transition-all animate-in slide-in-from-right ${
        type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg hover:bg-black/5 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Draggable File Input ────────────────────────────────────
function FileDropzone({
  accept,
  label,
  selectedFile,
  onFileSelect,
  onClear,
}: {
  accept: string;
  label: string;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-emerald-400 bg-emerald-50/50 scale-[1.01]'
          : selectedFile
            ? 'border-emerald-300 bg-emerald-50/30'
            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <FileText size={28} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Upload size={26} className="text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-700 text-sm">
              Drop your {label} here or <span className="text-emerald-600">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Accepted format: {accept}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────
function SectionCard({
  icon,
  title,
  subtitle,
  children,
  accentColor = 'emerald',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-200/40',
    blue: 'from-blue-400 to-blue-600 shadow-blue-200/40',
    violet: 'from-violet-400 to-violet-600 shadow-violet-200/40',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${accentMap[accentColor] || accentMap.emerald} shadow-md`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Transform scraper response → analyzer format ──────────
const transformScrapedToAnalyzer = (data: any[], year: number) => ({
  questions: data.map((item: any) => {
    const optionKeys = Object.keys(item.options || {});
    const optionValues = optionKeys.map((k) => item.options[k]);
    const correctAnswer = item.options[item.correct_answer] || item.correct_answer || '';
    return {
      year,
      question: item.question_text || '',
      options: optionValues,
      answer: correctAnswer,
    };
  }),
});

// ─── Main Admin Dashboard ────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('documents');

  // ── Document Upload State ──────────────────────────────────
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadDocuments, { isLoading: isUploading }] = useUploadDocumentsMutation();

  // ── Question Scraper State ─────────────────────────────────
  const [scraperFile, setScraperFile] = useState<File | null>(null);
  const [scraperSubject, setScraperSubject] = useState('');
  const [scraperExam, setScraperExam] = useState('');
  const [scrapedQuestions, setScrapedQuestions] = useState<any[] | null>(null);
  const [questionPaperScraper, { isLoading: isScraping }] = useQuestionPaperScraperMutation();
  const [postScrapQuestions] = usePostScrapQuestionsMutation()
  const [postQuestionPattern] = usePostQuestionPatternMutation()

  const [questionAnalyzer, { isLoading: isAnalyzing }] = useQuestionAnalyzerMutation();

  // ── Toast State ────────────────────────────────────────────
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Handle Document Upload ─────────────────────────────────
  const handleUploadDocuments = async () => {
    if (!docFile) {
      showToast('error', 'Please select a file to upload.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      await uploadDocuments(formData).unwrap();
      showToast('success', 'Document uploaded successfully for RAG ingestion!');
      setDocFile(null);
    } catch {
      showToast('error', 'Failed to upload document. Please try again.');
    }
  };

  // ── Handle Question Scraper ────────────────────────────────
  const handleScrapeQuestions = async () => {
    if (!scraperFile) {
      showToast('error', 'Please select a question paper PDF to upload.');
      return;
    }
    if (!scraperSubject.trim()) {
      showToast('error', 'Please enter the subject name.');
      return;
    }
        
    try {
      const formData = new FormData();
      formData.append('file', scraperFile);
      formData.append('subject', scraperSubject.trim());
      if (scraperExam.trim()) formData.append('exam', scraperExam.trim());
      const response = await questionPaperScraper(formData).unwrap();
      if(response){
        try{
            const payloadData = {
          exam: scraperExam.trim(),
          data: response.data
        }
        await postScrapQuestions(payloadData)
        }
        catch(err){
          console.log(err)
        }
      }

      const extracted = response?.data || demoData?.data;
      setScrapedQuestions(extracted);
      const analyzerPayload = transformScrapedToAnalyzer(extracted, Number(scraperExam) || new Date().getFullYear());
      try {
        const res = await questionAnalyzer(analyzerPayload).unwrap();
        if(res){
          await postQuestionPattern({
            exam:scraperExam.trim(),
            res
          })
        }
        

      } catch {
        showToast('error', 'Questions were scraped, but analysis failed. Please try again.');
        return;
      }
      showToast('success', `${extracted.length} questions scraped and analyzed successfully!`);
      setScraperFile(null);
      setScraperSubject('');
      setScraperExam('');
    } catch {
      showToast('error', 'Failed to scrape questions. Please try again.');
    }
  };

  // ── Helper to clear toast ──────────────────────────────────
  const clearToast = () => setToast(null);

  // ── Render Tab Content ─────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      // ════════════════════════════════════════════════════════
      //  DOCUMENT UPLOAD
      // ════════════════════════════════════════════════════════
      case 'documents':
        return (
          <SectionCard
            icon={<Upload size={18} className="text-white" />}
            title="Document Upload"
            subtitle="Upload PDF, DOC, or TXT files for RAG-based knowledge ingestion"
            accentColor="emerald"
          >
            <div className="space-y-5">
              <FileDropzone
                accept=".pdf,.doc,.docx,.txt,.md"
                label="document"
                selectedFile={docFile}
                onFileSelect={setDocFile}
                onClear={() => setDocFile(null)}
              />

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    RAG Knowledge Base
                  </p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Uploaded documents will be processed, chunked, and indexed into the vector
                    database. The AI assistant can then reference this content when answering
                    student queries.
                  </p>
                </div>
              </div>

              <button
                onClick={handleUploadDocuments}
                disabled={isUploading || !docFile}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-emerald-200/50 hover:shadow-md hover:shadow-emerald-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading & Indexing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload to RAG
                  </>
                )}
              </button>
            </div>
          </SectionCard>
        );

      // ════════════════════════════════════════════════════════
      //  QUESTION PAPER SCRAPER
      // ════════════════════════════════════════════════════════
      case 'scraper':
        return (
          <SectionCard
            icon={<FileSearch size={18} className="text-white" />}
            title="Question Paper Scraper"
            subtitle="Upload question paper PDFs to extract & store questions in the database"
            accentColor="blue"
          >
            <div className="space-y-5">
              <FileDropzone
                accept=".pdf"
                label="question paper"
                selectedFile={scraperFile}
                onFileSelect={setScraperFile}
                onClear={() => setScraperFile(null)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={scraperSubject}
                    onChange={(e) => setScraperSubject(e.target.value)}
                    placeholder="e.g. Bangladesh Affairs"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Exam (Optional)
                  </label>
                  <input
                    type="text"
                    value={scraperExam}
                    onChange={(e) => setScraperExam(e.target.value)}
                    placeholder="e.g. BCS 47th"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <BookOpen size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-800">
                    PDF Question Extraction
                  </p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    The system will parse the uploaded question paper PDF, extract individual
                    questions with their options, and store them in the question bank for
                    quiz and exam generation.
                  </p>
                </div>
              </div>

              <button
                onClick={handleScrapeQuestions}
                disabled={isScraping || isAnalyzing || !scraperFile || !scraperSubject.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 active:scale-[0.98] shadow-sm shadow-blue-200/50 hover:shadow-md hover:shadow-blue-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScraping || isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isScraping ? 'Scraping Questions...' : 'Analyzing Questions...'}
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Scrape & Store Questions
                  </>
                )}
              </button>

              {/* Scraper result preview */}
              {scrapedQuestions && scrapedQuestions.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-emerald-800">
                          {scrapedQuestions.length} Questions Extracted
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Analyzed and ready for review
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setScrapedQuestions(null)}
                      className="p-1.5 rounded-lg hover:bg-emerald-100/50 transition-colors text-emerald-500"
                    >
                      <X size={16} />
                    </button>
                  </div>

                </div>
              )}
            </div>
          </SectionCard>
        );
    }
  };

  return (
    <div className="w-full font-sans text-slate-800 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <StatusToast type={toast.type} message={toast.message} onClose={clearToast} />
      )}

      <main className="space-y-6">
        {/* ────── HEADER ────── */}
        <div className="flex items-center gap-3 pb-2">
          <div className="w-10 h-10 rounded-xl bg-[#0e1625] flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage RAG documents, scrape question papers, and analyze questions
            </p>
          </div>
        </div>

        {/* ────── TYPE BADGE ────── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          Admin Tools &bull; AI-Powered
        </div>

        {/* ────── TAB NAVIGATION ────── */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[#0e1625] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ────── TAB CONTENT ────── */}
        <div className="pt-2">{renderTabContent()}</div>
      </main>
    </div>
  );
}
