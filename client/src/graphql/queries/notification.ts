export const MARK_ALL_AS_READ = () => ({
    query: `
        mutation markAllAsRead {
            markAllAsRead
        }
    `
})

export const SEND_ADMIN_NOTIFICATION = () => ({
    query: `
        mutation sendAdminNotification($input: SendAdminNotificationInput!) {
            sendAdminNotification(input: $input)
        }
    `
})