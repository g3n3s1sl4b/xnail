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
    <div class="product-name">$${item.name}</div>
    <div class="product-price">$${item.price}</div>
    <div class="btn-toolbar justify-content-center" role="toolbar">
              <div class="btn-group mr-2" role="group" aria-label="First group">
                <button type="button" class="btn btn-secondary">1</button>
              </div>
              <div class="btn-group" role="group" aria-label="Third group">
                <button type="button" class="btn btn-secondary">8</button>
              </div>
            </div>
    </div>




            


           








    
    </div>
    </div>`;
  productsContainer.insertAdjacentHTML("beforeend", productHTML);
  });
}