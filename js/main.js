const pdfUrl = "../docs/sample.pdf";

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// Render page
const renderPage = num => {
    pageIsRendering = true;

    // Get page
    pdfDoc.getPage(num)
        .then(page => {
            console.log(page);

            // Set scale
            const viewport = page.getViewport({
                scale: scale
            });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderCtx = {
                canvasContext: ctx,
                viewport
            };

            page.render(renderCtx).promise
                .then(() => {
                    pageIsRendering = false;

                    if (pageNumIsPending !== null) {
                        renderPage(pageNumIsPending);
                        pageNumIsPending = null;
                    }
                });

            // Set page number
            document.querySelector('#page-num').textContent = num;
        })
        .catch(err => console.log(err));
};

// Set pending page number or render page
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
};

// Show prev page
const showPrevPage = () => {
    if (pageNum <= 1) {
        return;
    }

    pageNum--;
    queueRenderPage(pageNum);
};

// Show next page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }

    pageNum++;
    queueRenderPage(pageNum);
};

// Get document
pdfjsLib.getDocument(pdfUrl).promise
    .then(doc => {
        pdfDoc = doc;
        console.log(pdfDoc);

        document.querySelector('#page-count').textContent = pdfDoc.numPages;

        renderPage(pageNum);
    })
    .catch(err => {
        console.log(err);

        // Create and display error div
        const div = document.createElement('div');
        div.className = 'error';
        const text = document.createTextNode(err.message);
        div.appendChild(text);
        document.querySelector('body').insertBefore(div, canvas);

        // Remove top-bar div
        document.querySelector('.top-bar').style.display = 'none';
    });

// Button click listeners
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
