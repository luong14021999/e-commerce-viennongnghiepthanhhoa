"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { submitReviewAction } from "@/lib/actions";

type Review = {
  id: string;
  buyer_id: string;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  const active = hovered || value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          disabled={!onChange}
          className={`transition-transform ${onChange ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <svg
            className={`${sz} transition-colors ${s <= active ? "text-yellow-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
      <div className="text-center flex-shrink-0">
        <p className="text-5xl font-bold text-amber-500">{avg.toFixed(1)}</p>
        <Stars value={Math.round(avg)} size="md" />
        <p className="text-xs text-gray-500 mt-1">{reviews.length} đánh giá</p>
      </div>
      <div className="flex-1 w-full space-y-1.5">
        {counts.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="text-gray-600 w-3 text-right">{star}</span>
            <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-gray-500 w-4 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fetching, setFetching] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const myReview = reviews.find((r) => r.buyer_id === user?.id);
  const isBuyer = user?.role === "buyer";

  async function fetchReviews() {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
    setFetching(false);
  }

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment ?? "");
    }
  }, [myReview?.id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Vui lòng chọn số sao"); return; }
    setError("");
    startTransition(async () => {
      const res = await submitReviewAction({ productId, rating, comment });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        fetchReviews();
      } else {
        setError(res.error ?? "Lỗi hệ thống");
      }
    });
  }

  const STAR_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5">
        Đánh giá sản phẩm
      </h2>

      <RatingSummary reviews={reviews} />

      {/* Review form */}
      {isBuyer ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            {myReview ? "Đánh giá của bạn" : "Viết đánh giá"}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <Stars value={rating} onChange={setRating} size="lg" />
            {rating > 0 && (
              <span className="text-sm font-medium text-amber-600">{STAR_LABELS[rating]}</span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-white mb-3"
          />
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <div className="flex items-center justify-between">
            {success && <p className="text-green-600 text-xs font-medium">✓ Đã lưu đánh giá!</p>}
            <button
              type="submit"
              disabled={isPending}
              className="ml-auto bg-green-700 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors"
            >
              {isPending ? "Đang lưu..." : myReview ? "Cập nhật" : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      ) : user && !isBuyer ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 mb-6">
          Chỉ tài khoản người mua mới có thể đánh giá sản phẩm.
        </div>
      ) : !user ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 mb-6">
          <a href="/dang-nhap" className="text-green-700 font-semibold hover:underline">Đăng nhập</a>
          {" "}để viết đánh giá.
        </div>
      ) : null}

      {/* Reviews list */}
      {fetching ? (
        <div className="flex justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className={`border rounded-xl p-4 ${review.buyer_id === user?.id ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
                    {review.buyer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                      {review.buyer_name}
                      {review.buyer_id === user?.id && (
                        <span className="ml-1.5 text-xs text-green-600 font-normal">(bạn)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <Stars value={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
