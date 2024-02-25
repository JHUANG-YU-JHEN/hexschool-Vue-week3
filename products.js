import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

let productModal = null;
let delProductModal = null;

createApp({
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',
      apiPath: 'jhuangyujhen',
      products: [],
      isNew: false, //isNew 用於表示當前 Modal 是新增或編輯 Modal，以便做後續串接 API 時的判斷
      tempProduct: {  //tempProduct 是預期開啟 Modal 時會代入的資料
        imagesUrl: [],
      },
    }
  },
  mounted() { // new... 稱為建立實體 。此行指建立實體後賦予到productModal
    productModal = new bootstrap.Modal(document.getElementById('productModal'), {
      keyboard: false
    });

    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
      keyboard: false
    });

    // 取出 Token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;

    this.checkAdmin();
  },
  methods: {
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`; 
      axios.post(url)
        .then(() => {
          this.getData();
        })
        .catch((err) => {
          alert(err.response.data.message)
          window.location = 'login.html';
        })
    },
    getData() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products/all`; //all是指全部的沒有分頁，沒有寫all是指有分頁的
      axios.get(url).then((response) => {  //取得所有的列表.用then來接收成功的結果
        this.products = response.data.products;
      }).catch((err) => {
        alert(err.response.data.message);
      })
    },
    updateProduct() {  //建立(新增)產品
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`; //新增的api
      let http = 'post';
    
      if (!this.isNew) { //更新產品
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`; //更新的api
        http = 'put'
      }

      axios[http](url, { data: this.tempProduct }).then((response) => {
        alert(response.data.message);
        productModal.hide();
        this.getData();
      }).catch((err) => {
        alert(err.response.data.message);
      })
    },
    openModal(isNew, item) { //設定 isNew , item 兩個參數 。isNew 用於判斷當前點擊的是 新增 / 編輯 / 刪除 按鈕 ，item 代表的是當前點擊的產品資料
      if (isNew === 'new') { //利用 if 判斷，若 isNew 為 ‘new’，表示點擊到新增按鈕，所以清空當前的 tempProduct 內容，並將 isNew 的值改為 true，最後再開啟 productModal
        this.tempProduct = {
          imagesUrl: [], //雖然data中有加了，但因在其他流程中tempProduct會一直變動，不是data的初始狀態，所以為了確保是初始狀態就在寫一次imagesUrl: [] 
        };
        this.isNew = true;
        productModal.show(); //開啟 productModal
      } else if (isNew === 'edit') { //若 status 為 ‘edit’，表示點擊到編輯按鈕，所以使用展開運算子 …item 將當前產品資料傳入 tempProduct，再將 isNew 的值改為 false，最後開啟 productModal
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      } else if (isNew === 'delete') { //若 status 為 ‘delete’，表示點擊到刪除按鈕，同樣使用展開運算子將產品資料傳入 tempProduct，用意是後續串接刪除 API 時，需要取得該產品的 id，最後開啟 delProductModal
        this.tempProduct = { ...item }; 
        delProductModal.show()
      }
    },
    delProduct() { //刪除
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;

      axios.delete(url).then((response) => {
        alert(response.data.message);
        delProductModal.hide();
        this.getData(); // 更新資料後，重新取得所有產品的函式
      }).catch((err) => {
        alert(err.response.data.message);
      })
    },
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  },
}).mount('#app');