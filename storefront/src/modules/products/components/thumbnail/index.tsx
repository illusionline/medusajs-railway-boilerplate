import { clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square" | "portrait"
  isFeatured?: boolean
  alt?: string
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  alt = "ILLUSION Eveningwear",
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url
  const secondaryImage =
    images?.find((img) => img?.url && img.url !== initialImage)?.url ||
    (images?.[1]?.url && images[1].url !== initialImage
      ? images[1].url
      : undefined)

  return (
    <div
      className={clx(
        "relative w-full overflow-hidden p-0 bg-[#F5F5F5]",
        className,
        {
          "aspect-[4/5]": size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full" || size === "portrait",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder
        image={initialImage}
        secondaryImage={secondaryImage}
        size={size}
        alt={alt}
      />
    </div>
  )
}

const ImageOrPlaceholder = ({
  image,
  secondaryImage,
  size,
  alt,
}: Pick<ThumbnailProps, "size" | "alt"> & {
  image?: string
  secondaryImage?: string
}) => {
  return image ? (
    <>
      <Image
        src={image}
        alt={alt || "ILLUSION Eveningwear"}
        className="absolute inset-0 object-cover object-top"
        draggable={false}
        quality={85}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        fill
      />
      {secondaryImage && secondaryImage !== image && size === "full" && (
        <Image
          src={secondaryImage}
          alt={`${alt || "ILLUSION Eveningwear"} — Alternate View`}
          className="absolute inset-0 object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-100"
          draggable={false}
          quality={85}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          fill
        />
      )}
    </>
  ) : (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-[#F5F5F5] text-[#0A0A0A]/35">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
