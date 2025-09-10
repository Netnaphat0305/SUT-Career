package entity

import (
	"gorm.io/gorm"
	"time"
)
type Payments struct {
    gorm.Model

    Proof_of_Payment string    `json:"proof_of_payment" gorm:"column:proof_of_payment"`
    Amount           float32   `json:"amount"`
    Datetime         time.Time `json:"datetime"`

    BillableItemID   uint            `json:"billable_item_id"`
    BillableItem     *BillableItems  `gorm:"foreignKey: BillableItemID;references:ID" json:"billable_item"`

    PaymentMethodID  uint            `json:"payment_method_id"`
    PaymentMethod    *PaymentMethods `gorm:"foreignKey: PaymentMethodID;references:ID" json:"payment_method"`

    StatusID         uint       `json:"status_id"`
    Status           *Statuses  `gorm:"foreignKey: StatusID;references:ID" json:"status"`

    PaymentReportID  *uint           `json:"payment_report_id"`
    PaymentReport    *PaymentReports `gorm:"foreignKey: PaymentReportID;references:ID" json:"payment_report"`

	DiscountID		 *uint		`json:"discount_id"`
	Discount 		 *Discounts	`gorm:"foreignKey: DiscountID;references:ID" json:"discount"`
}