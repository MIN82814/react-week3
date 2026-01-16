import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as bootstrap from "bootstrap";
import axios from "axios";
import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
//建立初始化資料
const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setproducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  //控制目前modal是新增還是編輯還是刪除
  const [modalType, setModalType] = useState("");

  const productsModalRef = useRef(null);
  //登入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({ ...preData, [name]: value }));
  };
  //改變圖片值方法
  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      //解構方式先取得原本的原本陣列(陣列物件要改要複製一份出來)
      const newImages = [...pre.imagesUrl];
      //取得要改變的值的index
      newImages[index] = value;
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };

  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      //解構方式先取得原本的原本陣列(陣列物件要改要複製一份出來)
      const newImages = [...pre.imagesUrl];
      //多一筆空字串
      newImages.push("");
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };
  const handeleRemoveImage = () => {
    setTemplateProduct((pre) => {
      //解構方式先取得原本的原本陣列(陣列物件要改要複製一份出來)
      const newImages = [...pre.imagesUrl];
      //刪除最後一筆資料
      newImages.pop();
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };
  //新增編輯資料表單
  const handleModalInputChange = (e) => {
    //取checkbox值checked
    const { name, value, checked, type } = e.target;
    //判斷type是否為checkbox，如果不是要取input value
    setTemplateProduct((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //Cookie存取函式
  const saveToken = (token, expired) => {
    document.cookie = `minToken=${token};expires=${new Date(expired)};`;
    //如果登入成功取得token帶入header
    axios.defaults.headers.common["Authorization"] = token;
  };
  //表單按鈕驗證+token存取
  const onSubmit = async (e) => {
    try {
      e.preventDefault(); // 阻止表單自動刷新
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data; // 先在這裡拿到
      saveToken(token, expired); // 再傳給函式

      getProducts();
      setIsAuth(true);
    } catch (error) {
      const message = error.response?.data?.message || "表單驗證失敗";
      toast.error(message);
      setIsAuth(false);
    }
  };

  //Cookie取得函式
  const loadToken = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("minToken="))
      ?.split("=")[1];
    //先判斷是否有token，取得token帶入header
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
    return token;
  };
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = loadToken();
        //判斷是否有token沒有就跳出
        if (!token) return;
        const res = await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        const message = error.response?.data?.message || "登入失敗";
        toast.error(message);
        setIsAuth(false);
      }
    };
    productsModalRef.current = new bootstrap.Modal("#productModal");
    checkLogin();
  }, []);

  const openModal = (type, product) => {
    setModalType(type);
    setTemplateProduct((pre) => ({ ...pre, ...product }));
    productsModalRef.current.show();
  };
  const closeModal = () => {
    productsModalRef.current.hide();
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setproducts(res.data.products);
    } catch (error) {
      const message = error.response?.data?.message || "取得商品失敗";
      toast.error(message);
    }
  };
  //更新產品
  const updataProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";

    //如果是編輯就要改變url
    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    }
    const productData = {
      //送出資料前資料做轉換
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,
        //防呆避免圖片之前被傳入空的input，url不等於空字串就新增一個陣列進去
        imagesUrl: [...templateProduct.imagesUrl.filter((url) => url !== "")],
      },
    };
    try {
      const res = await axios[method](url, productData);
      getProducts();
      closeModal();
      toast.error("新增成功");
    } catch (error) {
      const message = error.response?.data?.message || "新增編輯失敗";
      toast.error(message);
    }
  };

  //刪除功能
  const delProduct = async (id) => {
    try {
      const res = await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      getProducts();
      closeModal();
      toast.error("刪除成功");
    } catch (error) {
      const message = error.response?.data?.message || "刪除失敗";
      toast.error(message);
    }
  };
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {!isAuth ? (
        <div className="container login">
          <h1>請登入</h1>
          <form className="form-floating " onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container mt-4">
          <h2 className="fw-bold dark-coffee-text mb-3">產品列表</h2>
          <div className="text-end mb-4">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
            >
              建立新產品
            </button>
          </div>
          <table className="table table-hover table-dark table-striped table-borderless">
            <thead>
              <tr>
                <th> 分類</th>
                <th> 產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
              </tr>
            </thead>
            <tbody className="align-middle">
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td className="py-3">{item.title}</td>
                  <td>{item.origin_price}</td>
                  <td>{item.price}</td>
                  <td className={`${item.is_enabled && "text-warning"}`}>
                    {item.is_enabled ? "啟用" : "未啟用"}
                  </td>
                  <td>
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic example"
                    >
                      <button
                        type="button"
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => openModal("edit", item)}
                      >
                        編輯
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => openModal("delete", item)}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div
        className="modal fade"
        id="productModal"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productsModalRef}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div
              className={`modal-header bg-${
                modalType === "delete" ? "danger" : "dark"
              } text-white`}
            >
              <h5 id="productModalLabel" className="modal-title">
                <span>
                  {modalType === "delete"
                    ? "刪除"
                    : modalType === "edit"
                    ? "編輯"
                    : "新增"}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {modalType === "delete" ? (
                <p className="fs-4">
                  確定要刪除
                  <span className="text-danger">{templateProduct.title}</span>
                  嗎？
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="請輸入圖片連結"
                          value={templateProduct.imageUrl}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      {/*判斷圖片有沒有值*/}
                      {templateProduct.imageUrl && (
                        <img
                          className="img-fluid"
                          src={templateProduct.imageUrl}
                          alt="主圖"
                        />
                      )}
                    </div>
                    <div>
                      {/*把多張圖片渲染在畫面上*/}
                      {templateProduct.imagesUrl.map((url, index) => (
                        <div key={index}>
                          <label htmlFor="imageUrl" className="form-label">
                            輸入圖片網址
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`圖片網址${index + 1}`}
                            value={url}
                            onChange={(e) =>
                              handleModalImageChange(index, e.target.value)
                            }
                          />
                          {templateProduct.imageUrl && (
                            <img
                              className="img-fluid"
                              src={url}
                              alt={`副圖${index + 1}`}
                            />
                          )}
                        </div>
                      ))}
                      {/*最多新增五張，最後一個 input 有值才顯示按鈕*/}
                      {templateProduct.imagesUrl.length < 5 &&
                        templateProduct.imagesUrl[
                          templateProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            className="btn btn-outline-primary btn-sm d-block w-100"
                            onClick={() => handleAddImage()}
                          >
                            新增圖片
                          </button>
                        )}
                    </div>
                    <div>
                      <button
                        className="btn btn-outline-danger btn-sm d-block w-100"
                        onClick={() => handeleRemoveImage()}
                      >
                        刪除圖片
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        標題
                      </label>
                      <input
                        name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={templateProduct.title}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">
                          分類
                        </label>
                        <input
                          name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={templateProduct.category}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">
                          單位
                        </label>
                        <input
                          name="unit"
                          id="unit"
                          type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={templateProduct.unit}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">
                          原價
                        </label>
                        <input
                          name="origin_price"
                          id="origin_price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={templateProduct.origin_price}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">
                          售價
                        </label>
                        <input
                          name="price"
                          id="price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={templateProduct.price}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        產品描述
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={templateProduct.description}
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">
                        說明內容
                      </label>
                      <textarea
                        name="content"
                        id="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={templateProduct.content}
                        onChange={(e) => handleModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="is_enabled"
                          id="is_enabled"
                          className="form-check-input"
                          type="checkbox"
                          checked={templateProduct.is_enabled}
                          onChange={(e) => handleModalInputChange(e)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="is_enabled"
                        >
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modalType === "delete" ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => delProduct(templateProduct.id)}
                >
                  刪除
                </button>
              ) : (
                <>
                  {" "}
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => closeModal()}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => updataProduct(templateProduct.id)}
                  >
                    確認
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
