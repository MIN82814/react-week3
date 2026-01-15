import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as bootstrap from "bootstrap";
import axios from "axios";
import "./assets/style.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setproducts] = useState([]);
  const [tempProduct, setTempProduct] = useState();

  const productsModalRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({ ...preData, [name]: value }));
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

  const openModal = () => {
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
              onClick={() => openModal()}
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
                      >
                        編輯
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
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
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="productModalLabel">
                新增產品
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {" "}
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
                      />
                    </div>
                    <img className="img-fluid" src={null} alt="主圖" />
                  </div>
                  <div>
                    <div>
                      <label htmlFor="imageUrl" className="form-label">
                        輸入圖片網址
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        // placeholder={`圖片網址${index + 1}`}
                      />
                      <img
                        className="img-fluid"
                        src={null}
                        // alt={`副圖${index + 1}`}
                      />
                    </div>
                    <button className="btn btn-outline-primary btn-sm d-block w-100">
                      新增圖片
                    </button>
                  </div>
                  <div>
                    <button className="btn btn-outline-danger btn-sm d-block w-100">
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
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        name="is_enabled"
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => closeModal()}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
