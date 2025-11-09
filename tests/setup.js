// Global fetch mock for unit tests
global.fetch = async (url) => {
  if (url.includes('cards')) {
    return {
      json: async () => ({
        content: { title: 'Taste the Colours' },
        items: [
          { image: 'a.jpg', title: 'Alpha', description: 'First card', alt: 'A' },
          { image: 'b.jpg', title: 'Beta', description: 'Second card', alt: 'B' }
        ]
      })
    }
  }
  if (url.includes('gallery')) {
    return {
      json: async () => ({
        content: {
          title: 'Cooking and gallery',
          paragraphs: ['Para 1', 'Para 2'],
          highlight: { title: 'Note', text: 'Yum' }
        },
        images: [
          { src: '1.jpg', large: '1L.jpg', alt: 'One' },
          { src: '2.jpg', large: '2L.jpg', alt: 'Two' }
        ]
      })
    }
  }
  return { json: async () => ({}) }
}
