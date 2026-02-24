const extensionId = 'review'

async function main() {
  return {
    statusCode: 200,
    body: {
      registration: {
        menuItems: [
          {
            id: `${extensionId}::reviews`,
            title: 'Product Reviews',
            sortOrder: 100
          }
        ],
        page: {
          title: 'Product Reviews'
        }
      }
    }
  }
}

exports.main = main
