import React, { useState } from "react";
import {
  useAddCommentMutation,
  useGetVideoCommentsQuery,
} from "@/slices/commentsApiSlice";
import { useGetCurrentUserQuery } from "@/slices/usersApiSlice";
import Button from "@/components/Button";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { ThumbsDown, ThumbsUp, EllipsisVertical } from "lucide-react";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommentsSection = ({ videoId }: { videoId: string }) => {
  const [enteredComment, setEnteredComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);

  const { data: comments, refetch: refetchComments } = useGetVideoCommentsQuery(
    videoId,
    { skip: !videoId }
  );
  const { data: loggedInUser } = useGetCurrentUserQuery(null);
  const [addComment] = useAddCommentMutation();

  const handleCommentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredComment(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleAddComment = async () => {
    try {
      if (enteredComment.trim()) {
        await addComment({ videoId, comment: enteredComment });
        refetchComments();
        setEnteredComment("");
        setIsFocused(false);
        toast.success(`Comment added"`);
      }
    } catch (error) {
      setEnteredComment("");
      setIsFocused(false);
      toast.error("Failed to add comment");
    }
  };

  const handleCancel = () => {
    setEnteredComment("");
    setIsFocused(false);
  };

  return (
    <div className="pt-4">
      <p className="text-xl">{comments?.data?.count} Comments</p>
      <div className="pt-8 flex gap-4">
        <img
          src={loggedInUser?.data?.avatar}
          alt={loggedInUser?.data?.fullName}
          className="size-12 rounded-full object-cover object-center"
        />
        <input
          type="text"
          className="bg-transparent h-5 pb-1 w-full border-b-2 focus:border-b-2 focus:border-gray-100 focus:outline-none"
          placeholder="Add a comment..."
          value={enteredComment}
          onChange={handleCommentInput}
          onFocus={handleFocus}
        />
      </div>

      {isFocused && (
        <div className="flex justify-end gap-2 mt-2">
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="px-4 rounded-3xl text-sm dark:hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddComment}
            variant={enteredComment === "" ? "disabled" : "ghost"}
            className={`px-4 rounded-3xl text-sm ${
              enteredComment === ""
                ? "text-gray-500"
                : "dark:bg-[#3ea6ff] text-black dark:hover:dark:bg-[#3ea5ffdd]"
            }`}
            disabled={enteredComment === ""}
          >
            Comment
          </Button>
        </div>
      )}
      {comments?.data?.videoComments?.map(
        (comment: {
          _id: string;
          userDetails: {
            userName: string;
            avatar: string;
            fullName: string;
          }[];
          updatedAt: Date;
          content: string;
        }) => (
          <div
            className="mt-4 flex gap-4 w-full"
            key={comment._id}
            onMouseEnter={() => setHoveredCommentId(comment._id)}
            onMouseLeave={() => setHoveredCommentId(null)}
          >
            <img
              src={comment?.userDetails[0]?.avatar}
              alt={comment?.userDetails[0]?.fullName}
              className="size-12 rounded-full object-cover object-center"
            />
            <div className="flex flex-col grow">
              <div className="flex gap-4">
                <p key={comment._id}>@{comment?.userDetails[0]?.userName}</p>
                <p key={comment._id}>
                  {formatTimeAgo(new Date(comment?.updatedAt))}
                </p>
                <div
                  className={`flex self-center ml-auto ${
                    hoveredCommentId === comment._id ? "" : "hidden"
                  } absolute right-2`}
                >
                  <Button variant="ghost" size="icon">
                    <EllipsisVertical size={20} className="cursor-pointer" />
                  </Button>
                </div>
              </div>

              <p key={comment._id} className="w-[95%]">
                {comment?.content}
              </p>

              <div className="flex">
                <Button variant="ghost" size="icon" className="justify-normal">
                  <ThumbsUp size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="justify-normal">
                  <ThumbsDown size={16} />
                </Button>

                <button className="pl-4 text-xs">Reply</button>
              </div>
            </div>
          </div>
        )
      )}
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        position="bottom-left"
        theme="dark"
        transition={Slide}
        stacked
      />
    </div>
  );
};

export default CommentsSection;
