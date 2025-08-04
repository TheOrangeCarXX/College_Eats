import "./Card.css";
function Card({children, onClick}) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default Card;
