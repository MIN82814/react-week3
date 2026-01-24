import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ modalType, templateProduct, closeModal, getProducts }) {
  const [tempData, setTempData] = useState(templateProduct);
  //每次變更templateProduct都要傳進去
  useEffect(() => {
    setTempData(templateProduct);
  }, [templateProduct]);
  //改變圖片值方法
  const handleModalImageChange = (index, value) => {
    setTempData((pre) => {
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
    setTempData((pre) => {
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
  const handleRemoveImage = () => {
    setTempData((pre) => {
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
    setTempData((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  //更新產品
  const updateProduct = async (id) => {
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
        ...tempData,
        origin_price: Number(tempData.origin_price),
        price: Number(tempData.price),
        is_enabled: tempData.is_enabled ? 1 : 0,
        //防呆避免圖片之前被傳入空的input，url不等於空字串就新增一個陣列進去
        imagesUrl: [...tempData.imagesUrl.filter((url) => url !== "")],
      },
    };
    try {
      const res = await axios[method](url, productData);
      getProducts();
      closeModal();
      toast.success("新增編輯成功");
    } catch (error) {
      const messages = error.response?.data?.message;
      toast.error(
        Array.isArray(messages)
          ? messages.join(", ")
          : messages || "新增編輯失敗",
      );
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
      toast.success("刪除成功");
    } catch (error) {
      const messages = error.response?.data?.message;
      toast.error(
        Array.isArray(messages) ? messages.join(", ") : messages || "刪除失敗",
      );
    }
  };
  //上傳圖片功能api
  const uploadImage = async (e) => {
    //取得上傳檔案
    const file = e.target.files?.[0];
    //如果沒有file就跳出
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      //用append方式把值加入，file-to-upload是api裡面name要取同樣名稱，file是剛剛取得檔案
      formData.append("file-to-upload", file);
      const res = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData,
      );
      setTempData((pre) => ({ ...pre, imageUrl: res.data.imageUrl }));
    } catch (error) {
      const messages = error.response?.data?.message;
      toast.error(
        Array.isArray(messages) ? messages.join(", ") : messages || "新增失敗",
      );
    }
  };
  return (
    <div
      className="modal fade"
      id="productModal"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
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
                <span className="text-danger">{tempData.title}</span>
                嗎？
              </p>
            ) : (
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="fileUpload" className="form-label">
                        上傳圖片
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="fileUpload"
                        id="fileUpload"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => uploadImage(e)}
                      />
                    </div>
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
                        value={tempData.imageUrl}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                    </div>
                    {/*判斷圖片有沒有值*/}
                    {tempData.imageUrl && (
                      <img
                        className="img-fluid"
                        src={tempData.imageUrl}
                        alt="主圖"
                      />
                    )}
                  </div>
                  <div>
                    {/*把多張圖片渲染在畫面上*/}
                    {tempData.imagesUrl.map((url, index) => (
                      <div key={index}>
                        <label
                          htmlFor={`imageUrl-${index}`}
                          className="form-label"
                        >
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id={`imageUrl-${index}`}
                          placeholder={`圖片網址${index + 1}`}
                          value={url}
                          onChange={(e) =>
                            handleModalImageChange(index, e.target.value)
                          }
                        />
                        {url && (
                          <img
                            className="img-fluid"
                            src={url}
                            alt={`副圖${index + 1}`}
                          />
                        )}
                      </div>
                    ))}
                    {/*最多新增五張，最後一個 input 有值才顯示按鈕*/}
                    {tempData.imagesUrl.length < 5 &&
                      tempData.imagesUrl[tempData.imagesUrl.length - 1] !==
                        "" && (
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
                      onClick={() => handleRemoveImage()}
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
                      value={tempData.title}
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
                        value={tempData.category}
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
                        value={tempData.unit}
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
                        value={tempData.origin_price}
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
                        value={tempData.price}
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
                      value={tempData.description}
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
                      value={tempData.content}
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
                        checked={tempData.is_enabled}
                        onChange={(e) => handleModalInputChange(e)}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-check-label" htmlFor="vegetarian">
                      素食選項
                    </label>
                    <select
                      id="vegetarian"
                      name="vegetarian"
                      className="form-select"
                      aria-label="Default select example"
                      value={tempData.vegetarian}
                      onChange={(e) => handleModalInputChange(e)}
                    >
                      <option value="">請選擇</option>
                      <option value="蛋奶素">蛋奶素</option>
                      <option value="全素">全素</option>
                      <option value="葷">葷</option>
                    </select>
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
                onClick={() => delProduct(tempData.id)}
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
                  onClick={() => updateProduct(tempData.id)}
                >
                  確認
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductModal;
