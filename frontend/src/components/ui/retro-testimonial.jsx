"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ===== Custom Hooks =====
const useOutsideClick = (ref, onOutsideClick) => {
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!ref.current || ref.current.contains(event.target)) {
				return;
			}
			onOutsideClick();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [ref, onOutsideClick]);
};

// ===== Components =====
const CarouselItem = ({ item, index, onCardClose }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				delay: 0.2 * index,
				ease: "easeOut",
				once: true,
			},
		}}
		key={`card-${index}`}
		className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
	>
		{React.cloneElement(item, {
			onCardClose: () => onCardClose(index),
		})}
	</motion.div>
);

const Carousel = ({ items, initialScroll = 0 }) => {
	const carouselRef = React.useRef(null);
	const [canScrollLeft, setCanScrollLeft] = React.useState(false);
	const [canScrollRight, setCanScrollRight] = React.useState(true);

	const checkScrollability = () => {
		if (carouselRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
		}
	};

	const handleScrollLeft = () => {
		if (carouselRef.current) {
			carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
		}
	};

	const handleScrollRight = () => {
		if (carouselRef.current) {
			carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
		}
	};

	const handleCardClose = (index) => {
		if (carouselRef.current) {
			const cardWidth = window && window.innerWidth < 768 ? 230 : 384;
			const gap = window && window.innerWidth < 768 ? 4 : 8;
			const scrollPosition = (cardWidth + gap) * (index + 1);
			carouselRef.current.scrollTo({
				left: scrollPosition,
				behavior: "smooth",
			});
		}
	};

	useEffect(() => {
		if (carouselRef.current) {
			carouselRef.current.scrollLeft = initialScroll;
			checkScrollability();
		}
	}, [initialScroll]);

	return (
		<div className="relative w-full mt-10">
			<div
				className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none] py-5"
				ref={carouselRef}
				onScroll={checkScrollability}
				style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
			>
				<style>{`
					.overflow-x-scroll::-webkit-scrollbar {
						display: none;
					}
				`}</style>
				<div
					className={cn(
						"absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l",
					)}
				/>
				<div
					className={cn(
						"flex flex-row justify-start gap-4 pl-3",
						"max-w-5xl mx-auto",
					)}
				>
					{items.map((item, index) => (
						<CarouselItem
							key={`item-${index}`}
							item={item}
							index={index}
							onCardClose={handleCardClose}
						/>
					))}
				</div>
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<button
					className="relative z-40 h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center disabled:opacity-50 hover:bg-gray-800 transition-colors duration-200"
					onClick={handleScrollLeft}
					disabled={!canScrollLeft}
				>
					<ArrowLeft className="h-6 w-6 text-white" />
				</button>
				<button
					className="relative z-40 h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center disabled:opacity-50 hover:bg-gray-800 transition-colors duration-200"
					onClick={handleScrollRight}
					disabled={!canScrollRight}
				>
					<ArrowRight className="h-6 w-6 text-white" />
				</button>
			</div>
		</div>
	);
};

const TestimonialCard = ({
	testimonial,
	_index,
	layout = false,
	onCardClose = () => {},
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const containerRef = useRef(null);

	const handleExpand = () => {
		return setIsExpanded(true);
	};
	const handleCollapse = React.useCallback(() => {
		setIsExpanded(false);
		onCardClose();
	}, [onCardClose]);

	useEffect(() => {
		const handleEscapeKey = (event) => {
			if (event.key === "Escape") {
				handleCollapse();
			}
		};

		if (isExpanded) {
			const scrollY = window.scrollY;
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
			document.body.style.overflow = "hidden";
			document.body.dataset.scrollY = scrollY.toString();
		} else {
			const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			document.body.style.overflow = "";
			window.scrollTo({ top: scrollY, behavior: "instant" });
		}

		window.addEventListener("keydown", handleEscapeKey);
		return () => {
			return window.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isExpanded, handleCollapse]);

	useOutsideClick(containerRef, handleCollapse);

	return (
		<>
			<AnimatePresence>
				{isExpanded && (
					<div className="fixed inset-0 h-screen overflow-hidden z-[9999] flex items-center justify-center">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="bg-white/60 dark:bg-black/60 backdrop-blur-2xl h-full w-full fixed inset-0"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							ref={containerRef}
							layoutId={layout ? `card-${testimonial.name}` : undefined}
							className="w-[90%] max-w-4xl bg-white dark:bg-black h-auto max-h-[85vh] overflow-y-auto z-[60] p-8 md:p-14 rounded-[2.5rem] relative shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-black/[0.05]"
						>
							<button
								className="absolute top-6 right-6 md:top-8 md:right-8 h-12 w-12 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 transition-colors border border-black/[0.03]"
								onClick={handleCollapse}
							>
								<X className="h-6 w-6 text-gray-900 dark:text-gray-100" />
							</button>
							
              <div className="flex items-center gap-6 mb-10">
                <ProfileImage src={testimonial.profileImage} alt={testimonial.name} className="w-20 h-20 md:w-24 md:h-24 shadow-md" />
                <div>
                  <motion.p
                    layoutId={layout ? `title-${testimonial.name}` : undefined}
                    className="text-2xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight"
                  >
                    {testimonial.name}
                  </motion.p>
                  <motion.p
                    layoutId={layout ? `category-${testimonial.name}` : undefined}
                    className="text-gray-500 text-lg md:text-xl font-semibold tracking-wide uppercase mt-1"
                  >
                    {testimonial.designation}
                  </motion.p>
                </div>
              </div>

							<div className="py-2 text-gray-800 dark:text-gray-200 text-2xl md:text-4xl font-medium leading-[1.4] tracking-tight relative">
								<Quote className="h-12 w-12 text-gray-200 absolute -top-4 -left-6 md:-left-8 -z-10 rotate-180" />
								"{testimonial.description}"
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
			<motion.button
				layoutId={layout ? `card-${testimonial.name}` : undefined}
				onClick={handleExpand}
				className="text-left w-full focus:outline-none"
				whileHover={{
					y: -8,
					scale: 1.01,
					transition: { duration: 0.4, ease: "easeOut" },
				}}
			>
				<div
					className={`rounded-[2rem] bg-white dark:bg-black border border-black/[0.04] h-[380px] md:h-[420px] w-80 md:w-[400px] flex flex-col relative z-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all p-8 md:p-10`}
				>
          <div className="flex items-center gap-4 mb-8">
					  <ProfileImage src={testimonial.profileImage} alt={testimonial.name} className="w-16 h-16 shadow-sm" />
            <div>
              <motion.p
                layoutId={layout ? `category-${testimonial.name}` : undefined}
                className="text-gray-900 dark:text-gray-100 text-lg font-bold"
              >
                {testimonial.name}
              </motion.p>
              <motion.p
                layoutId={layout ? `category-${testimonial.name}` : undefined}
                className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-0.5"
              >
                {testimonial.designation.length > 30
                  ? `${testimonial.designation.slice(0, 30)}...`
                  : testimonial.designation}
              </motion.p>
            </div>
          </div>
          
					<motion.p
						layoutId={layout ? `title-${testimonial.name}` : undefined}
						className="text-gray-700 text-lg md:text-xl font-medium leading-relaxed"
					>
						"{testimonial.description.length > 120
							? `${testimonial.description.slice(0, 120)}...`
							: testimonial.description}"
					</motion.p>
          
          <div className="mt-auto pt-6 flex items-center text-black dark:text-white font-bold text-sm tracking-wide gap-2 group">
             Read full story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
				</div>
			</motion.button>
		</>
	);
};

const ProfileImage = ({ src, alt, ...rest }) => {
	const [isLoading, setLoading] = useState(true);

	return (
		<div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] overflow-hidden rounded-full border-[4px] border-white shadow-xl flex-none relative z-20">
			<img
				className={cn(
					"transition duration-300 absolute top-0 inset-0 w-full h-full object-cover z-50",
					isLoading ? "blur-sm" : "blur-0",
				)}
				onLoad={() => {
					return setLoading(false);
				}}
				src={src}
				loading="lazy"
				decoding="async"
				alt={alt || "Profile image"}
				{...rest}
			/>
		</div>
	);
};

export { Carousel, TestimonialCard, ProfileImage };
