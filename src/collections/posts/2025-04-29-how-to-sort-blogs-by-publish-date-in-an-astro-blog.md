---
layout: blog
title: How to sort Blogs by Publish Date in an Astro Blog
publishDate: 2025-04-29T21:00:00.000Z
description: Learn how to organize your Astro blog posts by publish date by
  parsing frontmatter metadata using built-in JavaScript methods, ensuring your
  content displays in the correct chronological order.
tags:
  - astro
  - webdev
---
When you visit any blog, you might have noticed that the newest posts are listed at first. You can do this in your Astro blog as well using a very simple JavaScript method - `sort()`.

First of all, you need to have a publish date field in your frontmatter.

```md
---
layout: blog
title: Blog Title
publishDate: 2023-12-02
---
```

Now to sort the rendered posts in the blog archive page, include the following code:

```js
// Fetch all blogs
const allBlogPosts = await getCollection("blog");

// To sort in descending order (newest to oldest)
const sortedPosts = allBlogPosts.sort((a, b) => Date.parse(b.data.publishDate) - Date.parse(a.data.publishDate));

// To sort in ascending order (oldest to newest)
const sortedPosts = allBlogPosts.sort((a, b) => Date.parse(a.data.publishDate) - Date.parse(b.data.publishDate));
```

The `sort()` method of JavaScript takes two parameters `a` and `b`, and the compare function which is defined as a subtraction of the two parameters.
- If `a - b` is positive, then `a` should come after `b`.
- If `a - b` is negative, then `a` should come before `b`.
- Zero indicates both are equal.

The `Date.parse()` method parses a date string and returns its timestamp. For example the date string "2023-12-02" will return `1701475200000`.

For more details on the `sort()` and `Date.parse()` methods, refer the MDN docs.
