"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { usePrivy } from "@privy-io/react-auth";
import { supabase } from "../../../../lib/supabase-client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useStore, useCreatePersister } from "tinybase/ui-react";
import { createCustomPersister } from "tinybase";
import {
  createLocalPersister,
  Persister,
} from "tinybase/persisters/persister-browser";

type User = {
  id: string;
  givenName: string;
  familyName: string;
  villageNeighborhood: string;
  email?: string;
};

export default function Onboarding() {
  const { user, ready, authenticated } = usePrivy();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted, isValid },
  } = useForm<User>();
  const t = useTranslations("Onboarding");
  const store = useStore();
  const localPersister = useCreatePersister(store, (store) => {
    return createLocalPersister(store, "users");
  });
  const remotePersister = useCreatePersister(store!, (store) => {
    return createCustomPersister(
      store,
      async () => {
        const { data, error } = await supabase
          .from("users")
          .select(
            "name, family_name, village_neighborhood, phone_number, email, onboarded"
          )
          .eq("id", user?.id)
          .single();
        if (error) {
          throw error;
        }
        return [{ users: { [user?.id as string]: data } }, {}];
      },
      async (getContent) => {
        const storeJson = getContent();
        const { error } = await supabase
          .from("users")
          .update({
            name: storeJson.users[user?.id]?.name,
            family_name: storeJson.users[user?.id]?.family_name,
            village_neighborhood:
              storeJson.users[user?.id]?.village_neighborhood,
            phone_number: storeJson.users[user?.id]?.phone_number,
            email: storeJson.users[user?.id]?.email,
            onboarded: storeJson.users[user?.id]?.onboarded,
          })
          .eq("id", user?.id);
        if (error) {
          throw error;
        }
      },
      (listener) => setInterval(listener, 1000),
      (listener: any) => clearInterval(listener)
    );
  });
  if (!ready) return null;
  if (ready && !authenticated) {
    router.push("/");
  }
  const onSubmit: SubmitHandler<User> = async (data) => {
    try {
      await localPersister.load();
      store!.setPartialRow("users", user?.id, {
        name: data.givenName,
        family_name: data.familyName,
        village_neighborhood: data.villageNeighborhood,
        phone_number: user?.phone?.number,
        email: data.email,
        onboarded: true,
      });
      await localPersister.save();
      await remotePersister.save();
      // localPersister.destroy();
      // remotePersister.destroy();
      router.push(`/proposals/`);
    } catch (error) {
      console.log(error);
    }
  };
  const inputClasses = "w-full border border-slate-300 rounded h-10 pl-2 mb-6";
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="font-bold mb-6">{t("heading")}</h3>
      <input
        className={inputClasses}
        placeholder={t("firstName")}
        {...register("givenName")}
      />
      <input
        className={inputClasses}
        placeholder={t("lastName")}
        {...register("familyName")}
      />
      <input
        className={inputClasses}
        placeholder={t("location")}
        {...register("villageNeighborhood")}
      />
      <span className="text-red-600 text-xs">
        {" "}
        {errors.email && errors.email.message}
      </span>
      <input
        type="email"
        className={inputClasses}
        placeholder={t("email")}
        {...register("email")}
      />
      <p className="text-center text-xs italic mb-6">{t("disclaimer")}</p>
      <button
        className="w-full border border-slate-400 rounded leading-10 font-bold disabled:opacity-50"
        type="submit"
        disabled={!isValid}
      >
        {t("submitButton")}
        {isSubmitting ||
          (isSubmitted && (
            <svg
              aria-hidden="true"
              className="absolute right-0 top-1 w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          ))}
      </button>
    </form>
  );
}
