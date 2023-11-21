---
title: Wasted 3 hours to save 3 keystrokes
publishDate: 2023-03-19
description: 'I am building a command line tool using rust to save a couple of redundant keystrokes. But in the process, I wasted 3 hours, in a productive way.'
author: 'Shounak Das'
image:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'The full Astro logo.'uthor: 'Shounak Das'
tags: ['rust', 'cli', 'opensource']
---
It was a nice Sunday afternoon when I realized that my mid-semester exams are starting from this Friday. So, I decided to start studying, and fired up Google Classroom on the good old Firefox. As always, I was signed out of my college Gmail account (they do this every 15 minutes or so). After 3 or 4 attempts, I was able to guess the password. Then I spent the next 10 minutes trying to decide which subject to pick, as usual.

After much struggle, I chose Operating Systems. I like the subject, as long as I don't have to study it for the exams. Today, I started with process synchronization — critical section, producer-consumer problems and all those stuffs. Whenever I study something new, I always try to visualize stuff and try out things on my own. I like to see the results myself rather than reading the books. It's always easier to understand and remember things when you try it yourself, especially if you have a weak memory like me (or a weak urge to memorize, I don't know which one I have, honestly).

So there I was, trying to understand Peterson's solution. As usual, my brain ordered me to open ChatGPT in a new tab and look up for a code to demonstrate this algorithm. ChatGPT spit out some 10 lines of Python code. *Et voilà!* My miserable brain was able to interpret the algorithm. Now was the time to write the code on my own, and tweak with it. But, since I am learning Rust at the moment, I thought how about I rewrite the Python code in Rust and see how it goes. It would be a good beginner project, wouldn't it? Just when I was about to create the new rust project, another nice idea struck my mind. I created a GitHub repo where I will put all my rust projects. So I created a new local directory, where I would copy all the `main.rs` from different projects and rename them. This is where the 3 long hours started. Copying a file to a new location, then `cd`-ing into that location, and then renaming the file using `mv` is a long process. And I do not want to repeat the same steps every time. The solution? I decided to make a command-line tool in rust.

It's an easy job, but the only problem is that I don't know rust that well. So, I had to read the docs thoroughly to get an idea of how to do it. All this doc-reading took me more than 3 hours, and I am yet to start building the actual thing! XD  

Well, that's it for today. I will write another article on how I made the tool in a day or two. Over and out.

*84ck_783_914n37*