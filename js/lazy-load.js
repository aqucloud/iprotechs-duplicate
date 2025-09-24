
        // JavaScript to lazy load images when they come into the viewport
        function lazyLoadImages() {
            const lazyImages = document.querySelectorAll('.lazy-image');

            lazyImages.forEach((image) => {
                if (image.getAttribute('data-loaded') === 'false' && image.getBoundingClientRect().top < window.innerHeight) {
                    const img = image.querySelector('img');
                    const source = image.querySelector('source');

                    if (source) {
                        source.srcset = source.dataset.srcset;
                    }

                    img.src = img.dataset.src;
                    img.onload = () => {
                        image.classList.add('loaded');
                        image.setAttribute('data-loaded', 'true');
                    };
                }
            });
        }

        // Attach the lazyLoadImages function to the scroll event
        window.addEventListener('scroll', lazyLoadImages);
        // Call the function once on page load in case some images are immediately in the viewport
        window.addEventListener('load', lazyLoadImages);