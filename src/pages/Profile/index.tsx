import { useRef } from "react";

import { getIcons } from "@/assets/icons";
import { useProfile } from "./useProfile";
import { getImage } from "@/assets/images";
import { Layout } from "@/components/templates";
import { Header } from "@/components/organisms";
import { maskBirthday, maskPhone, maskZipCode } from "@/utils/utils";
import { Loading } from "@/components/elements";

export const Profile = () => {
  const { formik, loading } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          formik.setFieldValue("avatar", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col justify-start items-center h-full w-full">
        <Header title={"Profile"} backPath={"/account"} />

        {loading && <Loading />}
        <div className="flex flex-col h-full w-full p-4 pt-2 gap-2.5 overflow-y-auto">
          <div className="btn w-full h-auto bg-transparent border-0 shadow-none px-0 py-2.5 border-b-2 border-[#EBE9F1]">
            <div className="flex items-center w-full h-full">
              <div
                className="relative cursor-pointer min-w-fit"
                onClick={handleAvatarClick}
              >
                <img
                  alt="Image avatar"
                  src={formik.values.avatar || getImage("Jaja")}
                  className="size-[93px] rounded-[70px] border-3 object-cover border-white shadow-[0_0_14px_rgba(0,0,0,0.14)]"
                />
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                  <img
                    alt="Edit icon"
                    src={getIcons("camera")}
                    className="size-4"
                  />
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-col justify-start items-start w-full flex-grow pl-2">
                <p className="text-[#5E5873] inter text-2xl font-medium leading-[150%]">
                  Jaja teste
                </p>
                <p className="text-[#5E5873] inter text-base font-light leading-none">
                  teste@gmail.com
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col w-full gap-4"
          >
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Name
              </label>
              <input
                type="text"
                name="name"
                onBlur={formik.handleBlur}
                value={formik.values.name}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.name && formik.errors.name ? (
                <div className="text-red-500 text-sm">{formik.errors.name}</div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Email
              </label>
              <input
                type="email"
                name="email"
                onBlur={formik.handleBlur}
                value={formik.values.email}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.email}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                onBlur={formik.handleBlur}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                value={maskPhone(formik.values.phone)}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.phone && formik.errors.phone ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.phone}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Birthday
              </label>
              <input
                type="text"
                name="birthday"
                onBlur={formik.handleBlur}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                value={maskBirthday(formik.values.birthday)}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.birthday && formik.errors.birthday ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.birthday}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Zip code
              </label>
              <input
                type="text"
                name="zip_code"
                onBlur={formik.handleBlur}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                value={maskZipCode(formik.values.zip_code)}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.zip_code && formik.errors.zip_code ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.zip_code}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Address
              </label>
              <input
                type="text"
                name="address"
                onBlur={formik.handleBlur}
                value={formik.values.address}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.address && formik.errors.address ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.address}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                State
              </label>
              <input
                type="text"
                name="state"
                maxLength={2}
                onBlur={formik.handleBlur}
                value={formik.values.state}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.state && formik.errors.state ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.state}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col w-full gap-1">
              <label className="text-[#6E6B7B] text-base font-normal leading-[18px]">
                Country
              </label>
              <input
                type="text"
                name="country"
                onBlur={formik.handleBlur}
                value={formik.values.country}
                placeholder="Digite aqui..."
                onChange={formik.handleChange}
                className="w-full h-[48px] px-[10px] flex-shrink-0 rounded-[5px] border border-[#D8D6DE] bg-[#f7f8fd]"
              />
              {formik.touched.country && formik.errors.country ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.country}
                </div>
              ) : null}
            </div>
            <button
              type="submit"
              className="btn max-w-full border-none bg-[#6B7280] rounded text-[14px] text-[#FFF] py-[10px] font-[500] tracking-[0.4px]"
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
