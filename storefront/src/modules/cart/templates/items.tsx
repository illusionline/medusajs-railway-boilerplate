import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="pb-6 flex items-baseline justify-between border-b border-[#0A0A0A]/10">
        <h1 className="font-display text-3xl small:text-4xl font-light tracking-wide text-[#0A0A0A]">
          Shopping Bag
        </h1>
        {items && (
          <span className="text-xs uppercase tracking-[0.2em] text-[#0A0A0A]/55">
            {items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
            {items.reduce((acc, i) => acc + i.quantity, 0) === 1
              ? "Piece"
              : "Pieces"}
          </span>
        )}
      </div>
      <Table className="bg-transparent">
        <Table.Header className="border-t-0 bg-transparent">
          <Table.Row className="text-[#0A0A0A]/50 text-[11px] uppercase tracking-[0.18em] bg-transparent border-b border-[#0A0A0A]/10 hover:bg-transparent">
            <Table.HeaderCell className="!pl-0 font-normal">
              Piece
            </Table.HeaderCell>
            <Table.HeaderCell className="font-normal"></Table.HeaderCell>
            <Table.HeaderCell className="font-normal">Quantity</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell font-normal">
              Price
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right font-normal">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body className="border-b-0">
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(3).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
