import { render, screen } from "@testing-library/react"
import { WarrantyVault } from "@/components/warranty/warranty-vault"

describe("WarrantyVault Component", () => {
  it("renders warranty vault interface", () => {
    render(<WarrantyVault />)
    expect(screen.getByText(/warranty vault/i)).toBeInTheDocument()
  })

  it("displays upload section", () => {
    render(<WarrantyVault />)
    expect(screen.getByText(/upload/i)).toBeInTheDocument()
  })
})
