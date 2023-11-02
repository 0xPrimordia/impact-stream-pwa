"use client";

import { useCart } from "@/app/context/CartContext";
import { TSummaryProposal } from "@/app/types";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getVoiceCreditsCastByAllocatorToRecipient } from "../../utils/alloContract";
import AddRemoveCartButton from "./AddRemoveCartButton";

const CartItem = ({ item }: { item: TSummaryProposal }) => {
  const router = useRouter();
  const { user } = usePrivy();
  const [votes, setVotes] = useState<number>(0);
  const { handleAllocationChange } = useCart();
  const [votesCastedToRecipient, setVotesCastedToRecipient] =
    useState<number>(0);
  const onChangeHandler = (e: any) => {
    e.preventDefault();
    setVotes(Number(e.target.value));
    handleAllocationChange(item.allo_recipient_id!, e.target.value);
  };

  useEffect(() => {
    const load = async () => {
      setVotesCastedToRecipient(
        await getVoiceCreditsCastByAllocatorToRecipient(
          user!.wallet!.address,
          item.allo_recipient_id!
        )
      );
    };
    load();
  }, [user, item.allo_recipient_id]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-x-4 p-2 mt-2">
      <div className="flex flex-col sm:flex-row items-center justify-between cursor-pointer">
        <div
          className="flex text-sm font-medium leading-6 text-gray-900 border-b-sky-600"
          onClick={() => {
            router.push(`/proposals/${item.id}`);
          }}
        >
          {item.title}
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-x-4 items-center justify-between">
          <span className="text-sm">Vote Credits &nbsp;</span>
          <input
            id="voteCredits"
            type="number"
            min="0"
            className="w-24 border rounded-md shadow-sm bg-white p-2 mt-2"
            placeholder="0"
            onChange={onChangeHandler}
          />
          <AddRemoveCartButton grantId={item.id} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:gap-x-4 items-center justify-between">
        <span className="text-sm">
          Casted Voice Credits:{" "}
          <span className="font-semibold">{votesCastedToRecipient}</span>
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:gap-x-4 items-center justify-between">
        <span className="text-sm">
          Votes casted:{" "}
          <span className="font-semibold">
            {Math.sqrt(votesCastedToRecipient).toFixed(2)}
          </span>
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:gap-x-4 items-center justify-between">
        <span className="text-sm">
          Votes casted after vote:{" "}
          <span className="font-semibold">
            {Math.sqrt(votesCastedToRecipient + votes).toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  );
};

export default CartItem;
