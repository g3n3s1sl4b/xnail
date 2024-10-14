const productsContainer = document.querySelector('#products')

async function getProducts() {
  const res = await fetch('./products.json');
  const productsArray = await res.json();
  renderProducts(productsArray);
}

getProducts();

function renderProducts(productsArray) {
  productsArray.forEach(function (item) {
    const productHTML =` 
    <div class="col-md-6 col-xl-4" data-shuffle="item" data-groups=${item.group}>
    <div class="product-3" >
    <a class="product-media" href="#">
    <span class="badge badge-success badge-pos-right">-${item.discount}%</span>
    <img src=${item.img} alt="product">
    </a>
    <div class="product-detail">
    <h6><a href="#">${item.name}</a></h6>
    <div class="product-price">$${item.price}</div>
    </div>
    </div>
    </div>`;
  productsContainer.insertAdjacentHTML("beforeend", productHTML);
  });
}