import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as bootstrap from "bootstrap";
import axios from "axios";
import "./assets/style.css";
import ProductModal from "./assets/components/ProductModal";

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
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`,
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
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        handleModalInputChange={handleModalInputChange}
        handleModalImageChange={handleModalImageChange}
        handleAddImage={handleAddImage}
        handeleRemoveImage={handeleRemoveImage}
        delProduct={delProduct}
        updataProduct={updataProduct}
        closeModal={closeModal}
      />
    </>
  );
}

export default App;
