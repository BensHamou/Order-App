import React from "react";
import { useStyles } from "../styles";

const Logo = (props) => {
  const styles = useStyles();

  return (
    <img
      src="/images/logo.png"
      alt="Food Order"
      className={props.large ? styles.largeLogo : styles.logo}
    ></img>
  );
};

export default Logo;
