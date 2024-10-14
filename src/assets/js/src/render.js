const productsContainer = document.querySelector('#products')

async function getProducts(){
const res = await fetch('./products.json');
const productsArray = await res.json();
renderProducts(productsArray);
}

getProducts();

 function renderProducts(productsArray){
     productsArray.forEach(function (item) {
        const productHTML = ` <div class="col-md-6 col-xl-4" data-shuffle="item" data-groups=${item.group}>
              <div class="product-3" >
              <a class="product-media" href="#">
                  <span class="badge badge-success badge-pos-right">-25%</span>
                  <img src="assets/img/catalog/item.png" alt="product">
                </a>
                <div class="product-detail">
                  <div class="row mb-5 small-2 text-lighter">
                    <div class="col-auto">
                      <div class="rating rating-lg">
                        <label class="fa fa-star"></label>
                        <label class="fa fa-star"></label>
                        <label class="fa fa-star"></label>
                        <label class="fa fa-star"></label>
                        <label class="fa fa-star empty"></label>
                      </div>
                    </div>
                    <div class="col-auto ml-auto">
                      <span><i class="fa fa-eye pr-1 opacity-60"></i>${item.view}</span>
                    </div>
                  </div>
                  <h6><a href="#">${item.name}</a></h6>
                  <div class="product-price">$${item.price}</div>
                  <p class="text-center py-3 mb-0">
                    <button type="button" class="btn btn-label btn-secondary">
                      <label><i class="fa fa-shopping-cart"></i></label> Add to cart
                    </button>
                  </p>
                </div>

              </div>
            </div>
        `;
         productsContainer.insertAdjacentHTML("beforeend",productHTML);

    });
}