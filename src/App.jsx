import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
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
    checkLogin();
  }, []);
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
          <div className="row">
            <div className="col-md-6">
              <h2 className="fw-bold dark-coffee-text mb-3">產品列表</h2>
              <table className="table table-hover table-dark table-striped table-borderless">
                <thead>
                  <tr>
                    <th> 產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                      <td>
                        <button
                          className="btn btn-warning"
                          onClick={() => {
                            setTempProduct(item);
                          }}
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2 className="fw-bold dark-coffee-text mb-3">單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3 p-4 border-0 light-coffee-bg rounded-3 shadow-sm">
                  <div className="text-center">
                    <img
                      src={tempProduct.imageUrl}
                      className="card-img-top primary-image"
                      alt={tempProduct.title}
                    />
                  </div>
                  <div className="card-body text-start">
                    <h5 className="card-title fw-bold">
                      {tempProduct.title}
                      <span className="badge dark-coffee-bg ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-5 fs-6 dark-coffee-text">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl
                        .filter((url) => url && url.trim() !== "")
                        .map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${tempProduct.title}圖片${index + 1}`}
                            className="images me-2 rounded"
                          />
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
