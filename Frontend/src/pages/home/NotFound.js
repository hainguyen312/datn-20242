import React from "react";
import { Link } from "react-router-dom"
import FuzzyText from "../../components/text/FuzzyText";
import GradientText from "../../components/text/GradientText";
const NotFound = () => {
  return (
    <div className="bg-white w-screen h-screen flex flex-col justify-center items-center">
      {/* 404 */}
      <div className="">
          <img src={`${process.env.PUBLIC_URL}/404error.png`} className="w-[460px] h-auto:" alt="app icon"></img>
      </div>

      {/* Text */}
      <div className="text-blue-600 text-[36px] font-[600px] mt-[40px] ">
        <FuzzyText 
          baseIntensity={0.2} 
          fontSize="30px"
          hoverIntensity={0.5} 
          color="#3b82f6"
          enableHover={true}
        >
          What on earth are you doing here!?
        </FuzzyText>
      </div>

      <div className="text-blue-900 font-[600px] ">
        <FuzzyText 
          baseIntensity={0.2} 
          fontSize="30px"
          hoverIntensity={0.5} 
          enableHover={true}
          color="#3b82f6"
        >
          Well, this is awkward, the page you were trying to view does not exist.
        </FuzzyText>    
      </div>

      {/* Link to Home */}
      <div className="mt-[50px]">
        <Link to="/">
          <div className="text-blue-500 text-[30px] font-[600px]">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={4}
              showBorder={true}
            >
              To Homepage
            </GradientText>
          </div>
        </Link>
      </div>

    </div>  
  )

};

export default NotFound;
