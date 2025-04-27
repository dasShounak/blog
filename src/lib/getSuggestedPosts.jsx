export function getSuggestedPosts(allPosts, currentUrl, currentTags) {
  // random selection function
  const randomLot = (array, num) => {
    let newArray = []

    while (newArray.length < num && array.length > 0) {
      const randomIndex = Math.floor(Math.random() * array.length)
      newArray.push(array[randomIndex])
      array.splice(randomIndex, 1)
    }

    return newArray
  }

  const suggestedPosts = randomLot(allPosts.filter(post => `/blog/${post.id}` !== currentUrl && post.data.tags.includes(currentTags[0])), 3);

return randomLot(suggestedPosts, 4) // random selection
// return relatedPosts.slice(0, 4)
}
