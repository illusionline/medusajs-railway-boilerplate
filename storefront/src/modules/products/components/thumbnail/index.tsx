import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square" | "portrait"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url
  const secondaryImage = images?.[1]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-0 bg-[#F2EFE9] border border-[#0A0A0A]/10 rounded-none shadow-none",
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
      />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  secondaryImage,
  size,
}: Pick<ThumbnailProps, "size"> & {
  image?: string
  secondaryImage?: string
}) => {
  return image ? (
    <>
      <Image
        src={image}
        alt="ILLUSIONLINE eveningwear"
        className="absolute inset-0 object-cover object-center transition-transform duration-700 ease-luxury group-hover:scale-[1.04]"
        draggable={false}
        quality={80}
        sizes="(max-width: 576px) 50vw, (max-width: 992px) 33vw, 420px"
        fill
      />
      {secondaryImage && secondaryImage !== image && size === "full" && (
        <Image
          src={secondaryImage}
          alt="ILLUSIONLINE alternate view"
          className="absolute inset-0 object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-luxury group-hover:scale-[1.04]"
          draggable={false}
          quality={80}
          sizes="(max-width: 576px) 50vw, (max-width: 992px) 33vw, 420px"
          fill
        />
      )}
    </>
  ) : (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-[#F2EFE9] text-[#0A0A0A]/40">
      <PlaceholderImage size={size === "small" ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
