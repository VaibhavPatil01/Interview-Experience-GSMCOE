import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { userReviews } from '../assets/assets.js';

const UserReviews = () => {
  return (
    <section className="py-16 relative bg-gradient-to-b from-primary/5 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          <span className="inline-block pb-1">
            What Our <span className="text-primary">Users</span> Say
          </span>
        </h2>

        <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
          Hear directly from students who’ve used Interview Experience GSMCOE to ace their
          interviews.
        </p>

        {/* Swiper Reviews */}
        <Swiper
          slidesPerView={1}
          spaceBetween={30}
          pagination={{ clickable: true }}
          navigation
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          modules={[Pagination, Navigation, Autoplay]}
          className="mySwiper"
        >
          {userReviews.map((review, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-10 mx-4 md:mx-24 transition-all duration-300">
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 text-center sm:text-left">
                  “{review.text}”
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-gray-900 font-semibold text-lg">{review.name}</p>
                    <p className="text-gray-500 text-sm">{review.designation}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default UserReviews;
