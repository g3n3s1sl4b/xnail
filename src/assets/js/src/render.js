const productsContainer = document.querySelector('#products')

async function getProducts() {
  const res = await fetch('./products.json');
  const productsArray = await res.json();
  renderProducts(productsArray);
}

getProducts();

function renderProducts(productsArray) {
  productsArray.forEach(function (item) {
    const productHTML = `
    `;
    productsContainer.insertAdjacentHTML("beforeend", productHTML);
  });
}