import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Spinner from "../components/Spinner/Spinner"; // Import your spinner component
import "./ResultsPage.scss";
import StarRating from "../components/StarRating/StarRating";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { EffectCoverflow, Pagination } from "swiper/modules";

function ResultsPage() {
  document.title = "AlteraBooks: Results";
  const location = useLocation();
  const { subjectList } = location.state || {};
  const [resultsLoading, setResultsLoading] = useState(true);

  useEffect(() => {
    if (subjectList) {
      setResultsLoading(false);
    }
  }, [subjectList, setResultsLoading]);

  const getCoverUrl = (coverId) => {
    return coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : "default-cover.jpg";
  };

  return (
    <div className="wrap">
      <main>
        <Header />
        {resultsLoading ? (
          <Spinner />
        ) : (
          <div>
            <h3 className="rec">Recommended Books</h3>
            <Swiper
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={3}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={true}
              modules={[EffectCoverflow, Pagination]}
            >
              {subjectList && subjectList.length > 0 ? (
                subjectList.map((book, index) => (
                  <SwiperSlide key={index}>
                    <div>
                      <h2 className="rec">{book.title}</h2>
                      <img
                        src={getCoverUrl(book.cover_i)}
                        alt={book.title}
                        className="book-cover"
                      />
                      <h4>Author: {book.author_name?.join(", ")}</h4>
                      <StarRating rating={book.ratings_average || 0} />
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <p>No recommendations available.</p>
              )}
            </Swiper>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ResultsPage;
