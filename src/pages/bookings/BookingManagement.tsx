            <DataGrid
                rows={bookings}
                columns={columns}
                autoHeight
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                    },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableSelectionOnClick
                getRowId={(row) => row.bookingId} 