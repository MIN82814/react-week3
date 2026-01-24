function Pagination({ pagination, onChangePage }) {
  //拿掉a連結預設事件
  //換頁
  const handleClick = (e, page) => {
    e.preventDefault();
    onChangePage(page);
  };

  return (
    <>
      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
          {/*如果沒有前一頁的話就加上disabled*/}
          <li className={`page-item ${!pagination.has_pre && "disabled"}`}>
            <a
              className="page-link"
              href="#"
              aria-label="Previous"
              onClick={(e) => handleClick(e, pagination.current_page - 1)}
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {Array.from({ length: pagination.total_pages }, (_, index) => (
            <li
              className={`page-item ${pagination.current_page === index + 1 && "active"}`}
              key={`${index}_page`}
            >
              <a
                className="page-link"
                href="#"
                onClick={(e) => {
                  handleClick(e, index + 1);
                }}
              >
                {index + 1}
              </a>
            </li>
          ))}

          <li className={`page-item ${!pagination.has_next && "disabled"}`}>
            <a
              className="page-link"
              href="#"
              aria-label="Next"
              onClick={(e) => handleClick(e, pagination.current_page + 1)}
            >
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Pagination;
